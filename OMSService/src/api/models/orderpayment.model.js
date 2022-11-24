const { pick } = require('lodash');
const mongoose = require('mongoose');

const paymentStatus = ['created', 'success', 'failure', 'cancelled'];

/**
 * OrderPayment Schema
 * @private
 */
const orderPaymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Order',
    required: true,
  },
  status: {
    type: String,
    enum: paymentStatus,
    default: 'created',
  },
  requestId: {
    type: String,
    required: true,
  },
  retry: {
    type: Boolean,
    default: false,
  },
  meta: {
    type: Object,
  },
}, {
  timestamps: true,
});

orderPaymentSchema.set('toJSON', {
  transform: (doc) => pick(doc, [
    'status', 'requestId', 'meta',
  ]),
});

/**
 * @typedef OrderPayment
 */
module.exports = mongoose.model('OrderPayment', orderPaymentSchema);
