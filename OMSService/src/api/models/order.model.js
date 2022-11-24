const mongoose = require('mongoose');
const Constants = require('../utils/constants');

const orderStatus = ['created', 'cancelled', 'pending', 'processing', 'completed', 'cancellation_initiated'];

/**
 * Timestamp Schema
 * @private
 */
const timestampSchema = new mongoose.Schema({
  created: {
    type: Date,
    index: true,
  },
  cancelled: Date,
  pending: Date,
  processing: Date,
  completed: Date,
}, {
  _id: false,
});

/**
 * Order Schema
 * @private
 */
const orderSchema = new mongoose.Schema({
  processId: {
    type: String,
  },
  orderId: {
    type: String,
    unique: true,
    required: true,
  },
  customerId: {
    type: String,
    required: true,
  },
  type: {
    type: mongoose.Schema.ObjectId,
    ref: 'OrderType',
    required: true,
  },
  status: {
    type: String,
    enum: orderStatus,
    default: 'created',
  },
  amount: {
    type: Number,
    required: true,
  },
  meta: {
    type: Object,
  },
  timestamps: {
    type: timestampSchema,
    required: true,
  },
  cancellationComment: {
    type: String,
  },
  cancellationReason: {
    type: String,
  },
}, {
  timestamps: true,
});

/**
 * Virtuals
 */
orderSchema.virtual('items', {
  ref: 'OrderItem', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'orderId', // is equal to `foreignField`
});

// eslint-disable-next-line func-names
orderSchema.virtual('hasLoanEnhancementLoans').get(function () {
  if (!this.items) return undefined; // Guard clause when items are not populated
  return this.items.some(
    ({ meta }) => meta.repledgetype === Constants.repledgeType.LOAN_ENHANCEMENT,
  );
});

/**
* @typedef Order
*/
module.exports = mongoose.model('Order', orderSchema);
