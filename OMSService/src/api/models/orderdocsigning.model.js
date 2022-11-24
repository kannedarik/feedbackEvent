const mongoose = require('mongoose');

const docSigningStatus = ['created', 'success', 'failure', 'cancelled'];

/**
 * OrderDocSigning Schema
 * @private
 */
const orderDocSigningSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Order',
    required: true,
  },
  status: {
    type: String,
    enum: docSigningStatus,
    default: 'created',
  },
  requestId: {
    type: String,
    required: true,
  },
  meta: {
    type: Object,
  },
}, {
  timestamps: true,
});

/**
 * @typedef OrderDocSigning
 */
module.exports = mongoose.model('OrderDocSigning', orderDocSigningSchema);
