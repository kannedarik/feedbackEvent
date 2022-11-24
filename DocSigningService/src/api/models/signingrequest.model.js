const { includes } = require('lodash');
const axios = require('axios');
const mongoose = require('mongoose');
const moment = require('moment');
const SignService = require('../services/sign.service');
const { logger } = require('../../config/logger');

/**
 * Timestamp Schema
 * @private
 */
const timestampSchema = new mongoose.Schema({
  created: Date,
  processing: Date,
  pending: Date,
  success: Date,
  failure: Date,
  cancelled: Date,
  otpgenerated: Date,
}, {
  _id: false,
});

/**
 * SigningRequest Schema
 * @private
 */
const signingRequestSchema = new mongoose.Schema({
  order: {
    type: String,
    required: true,
  },
  correlationid: {
    type: String,
    required: true,
  },
  provider: {
    type: mongoose.Schema.ObjectId,
    ref: 'SigningProvider',
    required: true,
  },
  status: {
    type: mongoose.Schema.ObjectId,
    ref: 'SigningStatus',
    required: true,
  },
  type: {
    type: mongoose.Schema.ObjectId,
    ref: 'SigningType',
    required: true,
  },
  signer: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    required: true,
  },
  trackingid: {
    type: String,
    required: true,
  },
  callbackurl: {
    type: String,
  },
  timestamps: {
    type: timestampSchema,
    required: true,
  },
}, {
  timestamps: true,
});

/**
 * Statics
 */
signingRequestSchema.statics = {
  async cancelRequest(data, statusMap) {
    // cancelled old signing request
    const pendingRequest = await this.findOne({
      order: data.order,
      correlationid: data.correlationid,
      status: { $ne: statusMap.cancelled },
    });

    if (pendingRequest) {
      if (includes([statusMap.created, statusMap.processing], pendingRequest.status.toString())) {
        pendingRequest.status = statusMap.cancelled;
        pendingRequest.timestamps.cancelled = moment().toISOString();

        await Promise.all([
          pendingRequest.cancelRequest(),
          pendingRequest.save(),
        ]);
      }
    }

    return true;
  },

  async processWebhook(data, provider, statusMap) {
    const signServiceRes = SignService[provider].webhook(data);
    const signingrequest = await this.findOne({
      trackingid: signServiceRes.trackingid,
      status: { $in: [statusMap.created, statusMap.processing] },
    });

    if (signingrequest) {
      if (signServiceRes.status === 'success') {
        await signingrequest.successRequest(signServiceRes, statusMap, true);
      }
      if (signServiceRes.status === 'failure') {
        await signingrequest.failureRequest(signServiceRes, statusMap, true);
      }
    }

    return true;
  },

  async processCallback(signingrequest) {
    if (signingrequest.callbackurl) {
      const options = {
        method: 'POST',
        url: signingrequest.callbackurl,
        data: signingrequest,
      };

      try {
        await axios(options);
      } catch (err) {
        logger.error(`SigningRequest: ${signingrequest._id}, URL: ${signingrequest.callbackurl}, Error: ${err.message}`);
      }
    }

    return true;
  },
};

/**
 * @typedef SigningRequest
 */
module.exports = mongoose.model('SigningRequest', signingRequestSchema);
