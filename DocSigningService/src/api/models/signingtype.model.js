const { pick } = require('lodash');
const mongoose = require('mongoose');

/**
 * SigningType Schema
 * @private
 */
const signingTypeSchema = new mongoose.Schema({
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

signingTypeSchema.set('toJSON', {
  virtuals: true,
  transform: (doc) => pick(doc, ['id', 'name', 'description']),
});

/**
 * @typedef SigningType
 */
module.exports = mongoose.model('SigningType', signingTypeSchema);
