const mongoose = require('mongoose');

/**
 * SigningProvider Schema
 * @private
 */
const signingProviderSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  type: {
    type: mongoose.Schema.ObjectId,
    ref: 'SigningType',
    required: true,
  },
  archived: {
    type: Boolean,
    default: false,
  },
  archivedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

/**
 * @typedef SigningProvider
 */
module.exports = mongoose.model('SigningProvider', signingProviderSchema);
