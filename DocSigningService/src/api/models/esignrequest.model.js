/* eslint-disable no-param-reassign */
const { includes } = require('lodash');
const mongoose = require('mongoose');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const SigningDocument = require('./signingdocument.model');
const SigningRequest = require('./signingrequest.model');
const SignService = require('../services/sign.service');
const S3Service = require('../services/s3.service');
const { esign } = require('../../config/vars');

/**
 * ESignRequest Schema
 * @private
 */
const eSignRequestSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.ObjectId,
    ref: 'SigningDocument',
    required: true,
  },
  signeddocument: {
    type: mongoose.Schema.ObjectId,
    ref: 'SigningDocument',
  },
  signurl: {
    type: String,
    required: true,
  },
  error: {
    type: String,
  },
  custom: {
    type: mongoose.Schema.Types.Mixed,
  },
});

/**
 * Methods
 */
eSignRequestSchema.method({
  async processRequest(statusMap) {
    if (this.status.name === 'success') {
      await this.populate('signeddocument').execPopulate();
      return this;
    }
    if (includes(['created', 'processing'], this.status.name)) {
      const eSignServiceRes = await SignService[this.provider.name].details({
        endpoint: this.provider.url,
        password: this.provider.password,
        trackingid: this.trackingid,
      });

      if (eSignServiceRes.status === 'success') {
        const data = await this.successRequest(eSignServiceRes, statusMap);
        return data;
      }
      if (eSignServiceRes.status === 'failure') {
        const data = await this.failureRequest(eSignServiceRes, statusMap);
        return data;
      }
      if (eSignServiceRes.status === 'processing') {
        const data = await this.processingRequest(statusMap);
        return data;
      }
    }

    return this;
  },

  async successRequest(data, statusMap, populateProvider = false) {
    const filename = uuidv4();
    const s3Res = await S3Service.upload({
      filename: `${filename}.${esign.document.extension}`,
      bucket: esign.storage.bucket,
      path: `${filename}.${esign.document.extension}`,
      basedata: Buffer.from(data.signeddocument, 'base64'),
      contentType: esign.document.contentType,
      region: esign.storage.region,
    });

    const document = await SigningDocument.create(s3Res);

    this.status = statusMap.success;
    this.timestamps.success = moment().toISOString();
    this.signeddocument = document.id;
    await this.save();

    await this.populate(`${populateProvider ? 'status provider signeddocument' : 'status signeddocument'}`).execPopulate();

    // process callback (async)
    SigningRequest.processCallback(this);

    return this;
  },

  async failureRequest(data, statusMap, populateProvider = false) {
    this.status = statusMap.failure;
    this.error = data.error;
    this.timestamps.failure = moment().toISOString();
    await this.save();

    await this.populate(`${populateProvider ? 'status provider' : 'status'}`).execPopulate();

    // process callback (async)
    SigningRequest.processCallback(this);

    return this;
  },

  async processingRequest(statusMap) {
    this.status = statusMap.processing;
    this.timestamps.processing = moment().toISOString();
    await this.save();

    await this.populate('status').execPopulate();
    return this;
  },

  async cancelRequest() {
    await this.populate('provider').execPopulate();

    await SignService[this.provider.name].cancel({
      endpoint: this.provider.url,
      password: this.provider.password,
      trackingid: this.trackingid,
    });

    return true;
  },
});

/**
 * Statics
 */
eSignRequestSchema.statics = {
  async createRequest(data, provider, statusMap) {
    const filename = uuidv4();
    const [s3Res, eSignServiceRes] = await Promise.all([
      S3Service.upload({
        filename: `${filename}.${esign.document.extension}`,
        bucket: esign.storage.bucket,
        path: `${filename}.${esign.document.extension}`,
        basedata: Buffer.from(data.document, 'base64'),
        contentType: esign.document.contentType,
        region: esign.storage.region,
      }),
      SignService[provider.name].create({
        endpoint: provider.url,
        password: provider.password,
        filename: data.purpose,
        data: data.document,
        name: data.signer.name,
        phone: data.signer.phone,
        baseurl: data.baseurl,
        redirecturl: data.redirecturl,
      }),
    ]);

    const document = await SigningDocument.create(s3Res);
    const signingrequest = await this.create({
      ...eSignServiceRes,
      order: data.order,
      correlationid: data.correlationid,
      provider: provider.id,
      status: statusMap.created,
      type: data.type,
      signer: data.signer.id,
      client: data.client,
      document: document.id,
      ...(data.callbackurl && { callbackurl: data.callbackurl }),
      ...(data.custom && { custom: data.custom }),
      timestamps: {
        created: moment().toISOString(),
      },
    });

    return signingrequest;
  },
};

/**
 * @typedef ESignRequest
 */
module.exports = SigningRequest.discriminator('ESignRequest', eSignRequestSchema);
