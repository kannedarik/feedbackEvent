const { pick } = require('lodash');
const mongoose = require('mongoose');
const SigningProvider = require('./signingprovider.model');

/**
 * ESignProvider Schema
 * @private
 */
const eSignProviderSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  key: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
});

eSignProviderSchema.set('toJSON', {
  virtuals: true,
  transform: (doc) => pick(doc, ['id', 'name', 'description', 'url', 'key', 'type']),
});

/**
 * @typedef ESignProvider
 */
module.exports = SigningProvider.discriminator('ESignProvider', eSignProviderSchema);
