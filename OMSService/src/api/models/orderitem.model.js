const mongoose = require('mongoose');

/**
 * OrderItem Schema
 * @private
 */
const orderItemSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Order',
    required: true,
  },
  meta: {
    type: Object,
    required: true,
  },
}, {
  timestamps: true,
});

orderItemSchema.statics.toOldLoanGeneralLedger = function toOldLoanGeneralLedger(item) {
  const { meta } = item;
  return {
    securedLoanAmount: meta.oldsecureamount,
    unsecuredLoanAmount: meta.oldunsecureamount,
    securedLoanId: meta.lmsid,
    unsecuredLoanId: meta.unsecurelmsid,
  };
};

/**
* @typedef OrderItems
*/
module.exports = mongoose.model('OrderItem', orderItemSchema);
