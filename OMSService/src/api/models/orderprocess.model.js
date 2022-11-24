const { pick } = require('lodash');
const mongoose = require('mongoose');

/**
 * OrderProcess Schema
 * @private
 */
const orderProcessSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
    required: true,
    unique: true,
  },
  type: {
    type: mongoose.Schema.ObjectId,
    ref: 'OrderType',
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

orderProcessSchema.set('toJSON', {
  virtuals: true,
  transform: (doc) => pick(doc, ['id', 'name']),
});

/**
 * @typedef OrderProcess
 */
module.exports = mongoose.model('OrderProcess', orderProcessSchema);
