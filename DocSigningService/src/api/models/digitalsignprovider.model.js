const { pick } = require('lodash');
const mongoose = require('mongoose');
const SigningProvider = require('./signingprovider.model');

/**
 * DigitalSignProvider Schema
 * @private
 */
const digitalSignProviderSchema = new mongoose.Schema({
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
  custom: {
    type: mongoose.Schema.Types.Mixed,
  },
});

digitalSignProviderSchema.set('toJSON', {
  virtuals: true,
  transform: (doc) => pick(doc, ['id', 'name', 'description', 'url', 'key', 'type', 'custom']),
});

/**
 * @typedef DigitalSignProvider
 */
module.exports = SigningProvider.discriminator('DigitalSignProvider', digitalSignProviderSchema);
