const mongoose = require('mongoose');


/**
 * File Schema
 * @private
 */
const datatableSchema = new mongoose.Schema({
  lenderid: {
    type: String,
    required: true,
  },
  slno: {
    type: String,
    required: true,
  },
  loanaccountnumber: {
    type: String,
    required: true,
  },
  customerid: {
    type: String,
  },
  customername: {
    type: String,
  },
  sanctioneddate: {
    type: String,
  },
  sanctionedlimit: {
    type: String,
  },
  interestrate: {
    type: String,
  },
  schemecode: {
    type: String,
  },
  schemeduration: {
    type: String,
  },
  schemename: {
    type: String,
  },
  grossweight: {
    type: String,
    required: true,
  },
  netweight: {
    type: String,
  },
  phonenumber: {
    type: String,
  },
  outstandingbalance: {
    type: String,
  },
  interestamount: {
    type: String,

  },
  penalamount: {
    type: String,
  },
  processingfee: {
    type: String,
  },
  closureamount: {
    type: String,

  },
  repledgeamount: {
    type: String,
  },

  closeddate: {
    type: String,
  },
  expirydate: {
    type: String,

  },
  todaydate: {
    type: String,
  },
  status: {
    type: String,

  },
  additionalnumber: {
    type: String,
  },
}, {
  timestamps: true,
});

/**
 * Statics
 */

datatableSchema.index({
  lenderid: 1, loanaccountnumber: 1,
}, { unique: true });
/**
 * @typedef File
 */
module.exports = mongoose.model('misrawdata', datatableSchema);
