const mongoose = require('mongoose');
const moment = require('moment');
const SigningRequest = require('./signingrequest.model');
const SignService = require('../services/sign.service');
const OTPHelper = require('../utils/otp');
const { digital } = require('../../config/vars');

/**
 * DigitalSignRequest Schema
 * @private
 */
const digitalSignRequestSchema = new mongoose.Schema({
  phone: {
    type: String,
    minlength: 10,
    maxlength: 10,
    required: true,
  },
  attempts: {
    type: Number,
    default: digital.attempts,
  },
  otp: {
    type: String,
    minlength: digital.length,
    required: true,
  },
});

/**
 * Methods
 */
digitalSignRequestSchema.method({
  async processRequest() {
    return this;
  },

  async successRequest(statusMap, populateProvider = false) {
    this.status = statusMap.success;
    this.timestamps.success = moment().toISOString();
    await this.save();

    await this.populate(`${populateProvider ? 'status provider' : 'status'}`).execPopulate();

    // process callback (async)
    SigningRequest.processCallback(this);

    return this;
  },

  async failureRequest(statusMap, populateProvider = false) {
    this.status = statusMap.failure;
    this.timestamps.failure = moment().toISOString();
    this.attempts -= 1;
    await this.save();

    await this.populate(`${populateProvider ? 'status provider' : 'status'}`).execPopulate();

    // process callback (async)
    SigningRequest.processCallback(this);

    return this;
  },

  async processingRequest(statusMap) {
    this.status = statusMap.processing;
    this.timestamps.processing = moment().toISOString();
    this.attempts -= 1;
    await this.save();

    await this.populate('status').execPopulate();
    return this;
  },

  async cancelRequest() {
    return true;
  },

  async updateRequest(provider) {
    const digitalSignServiceRes = await SignService[provider.name].create({
      endpoint: provider.url,
      key: provider.key,
      password: provider.password,
      customerid: this.signer,
      customerphone: this.phone,
      custom: provider.custom,
      otp: this.otp,
    });

    this.provider = provider.id;
    this.trackingid = digitalSignServiceRes.trackingid;
    this.save();

    return true;
  },
});

/**
 * Statics
 */
digitalSignRequestSchema.statics = {
  async createRequest(data, provider, statusMap) {
    const otp = OTPHelper.generate(digital.length, {
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });

    const digitalSignServiceRes = await SignService[provider.name].create({
      endpoint: provider.url,
      key: provider.key,
      password: provider.password,
      customerid: data.signer.id,
      customername: data.signer.name,
      customerphone: data.signer.phone,
      custom: provider.custom,
      otp,
    });

    const signingrequest = await this.create({
      order: data.order,
      correlationid: data.correlationid,
      provider: provider.id,
      status: statusMap.created,
      type: data.type,
      signer: data.signer.id,
      trackingid: digitalSignServiceRes.trackingid,
      client: data.client,
      ...(data.callbackurl && { callbackurl: data.callbackurl }),
      phone: data.signer.phone,
      attempts: digital.attempts,
      otp,
      timestamps: {
        created: moment().toISOString(),
        otpgenerated: moment().toISOString(),
      },
    });

    return signingrequest;
  },

  async verifyRequest(signingrequest, request, statusMap) {
    if ((signingrequest.attempts - 1) > 0) {
      if (signingrequest.otp === request.otp) {
        const data = await signingrequest.successRequest(statusMap);
        return data;
      }
      const data = await signingrequest.processingRequest(statusMap);
      return data;
    }

    const data = await signingrequest.failureRequest(statusMap);
    return data;
  },
};

/**
 * @typedef DigitalSignRequest
 */
module.exports = SigningRequest.discriminator('DigitalSignRequest', digitalSignRequestSchema);
