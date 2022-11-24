const mongoose = require('mongoose');


/**
 * File Schema
 * @private
 */
const misfileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  s3key: {
    type: String,
    required: true,
  },
  status: {
    type: String,
  },
  mode: {
    type: String,
    required: true,
  },
  extension: {
    type: String,
    required: true,
  },
  totalcount: {
    type: Number,
  },
  invalidcount: {
    type: Number,
  },
  lender: {
    type: String,
    required: true,
  },
  type: {
    type: String,
  },
}, {
  timestamps: true,
});

/**
 * Statics
 */


/**
 * @typedef File
 */
module.exports = mongoose.model('misfile', misfileSchema);
