const { pick } = require('lodash');
const mongoose = require('mongoose');

/**
 * SigningStatus Schema
 * @private
 */
const signingStatusSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
    required: true,
    unique: true,
  },
  description: {
    type: String,
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

signingStatusSchema.set('toJSON', {
  virtuals: true,
  transform: (doc) => pick(doc, ['id', 'name', 'description']),
});

/**
 * @typedef SigningStatus
 */
module.exports = mongoose.model('SigningStatus', signingStatusSchema);
