const mongoose = require('mongoose');


/**
 * File Schema
 * @private
 */
const transactionsSchema = new mongoose.Schema({
  lenderid: {
    type: String,
    required: true,
  },
  loanaccountnumber: {
    type: String,
    required: true,
  },
  transactiondate: {
    type: String,
  },
  valuedate: {
    type: String,
  },
  type: {
    type: String,
  },
  transactionamount: {
    type: String,
  },
  particulars: {
    type: String,
  },

}, {
  timestamps: true,
});

transactionsSchema.index({
  lenderid: 1, loanaccountnumber: 1, particulars: 1, transactiondate: 1,
}, { unique: true });

/**
 * Statics
 */


/**
 * @typedef File
 */
module.exports = mongoose.model('transactions', transactionsSchema);
