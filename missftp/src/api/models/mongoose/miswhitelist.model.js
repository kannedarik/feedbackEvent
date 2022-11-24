const mongoose = require('mongoose');


/**
 * File Schema
 * @private
 */
const miswhitelistmatrixSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  extension: {
    type: String,
  },
  lender: {
    type: String,
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
module.exports = mongoose.model('whitelistmetrics', miswhitelistmatrixSchema);
