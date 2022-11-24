const { pick } = require('lodash');
const mongoose = require('mongoose');
const SigningProvider = require('./signingprovider.model');

/**
 * PhysicalSignProvider Schema
 * @private
 */
const physicalSignProviderSchema = new mongoose.Schema({});

physicalSignProviderSchema.set('toJSON', {
  virtuals: true,
  transform: (doc) => pick(doc, ['id', 'name', 'description', 'url', 'key', 'type']),
});

/**
 * @typedef PhysicalSignProvider
 */
module.exports = SigningProvider.discriminator('PhysicalSignProvider', physicalSignProviderSchema);
