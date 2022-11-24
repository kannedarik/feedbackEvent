const mongoose = require('mongoose');
const _ = require('lodash');

const { loantoschememap } = require('../utils/constants');

/**
 * DifferentialScheme Schema
 * @private
 */
const differentialSchemeSchema = new mongoose.Schema({
  GLId: {
    type: String,
    required: true,
  },
  scheme: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: String,
    required: true,
  },
  lastUploadedAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: _.values(loantoschememap.status),
    default: loantoschememap.status.active,
  },
}, { timestamps: true });

/**
 * @typedef DifferentialScheme
 */
module.exports = mongoose.model('DifferentialScheme', differentialSchemeSchema);
