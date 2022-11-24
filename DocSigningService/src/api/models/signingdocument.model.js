const { pick } = require('lodash');
const mongoose = require('mongoose');
const S3Service = require('../services/s3.service');

/**
 * SigningDocument Schema
 * @private
 */
const signingDocumentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  contenttype: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
    unique: true,
  },
  bucket: {
    type: String,
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

signingDocumentSchema.virtual('url').get(function signedURL() {
  return S3Service.getSignedURL(this.path, this.bucket, 24);
});

signingDocumentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc) => pick(doc, ['id', 'path', 'url']),
});

/**
 * @typedef SigningDocument
 */
module.exports = mongoose.model('SigningDocument', signingDocumentSchema);
