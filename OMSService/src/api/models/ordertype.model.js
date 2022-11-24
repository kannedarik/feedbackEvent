const { pick } = require('lodash');
const mongoose = require('mongoose');

/**
 * OrderType Schema
 * @private
 */
const orderTypeSchema = new mongoose.Schema({
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

orderTypeSchema.set('toJSON', {
  virtuals: true,
  transform: (doc) => pick(doc, ['id', 'name', 'description']),
});

/**
 * @typedef OrderType
 */
module.exports = mongoose.model('OrderType', orderTypeSchema);
