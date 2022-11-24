const mongoose = require('mongoose');
const _ = require('lodash');

const { differentialschemefileupload } = require('../utils/constants');

/**
 * File Upload Schema
 * @private
 */
const fileUploadSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  uploadedon: {
    type: Date,
    default: new Date(),
  },
  totalrowcount: {
    type: Number,
    required: true,
    default: 0,
  },
  processedrowcount: {
    type: Number,
    required: true,
    default: 0,
  },
  errorrowcount: {
    type: Number,
    required: true,
    default: 0,
  },
  receivedrowcount: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: String,
    enum: _.values(differentialschemefileupload.status),
    default: differentialschemefileupload.status.created,
    required: true,
  },
  errorfilelink: {
    type: String,
    default: '',
  },
  fileuploadidentifier: {
    type: String,
    enum: _.values(differentialschemefileupload.actionTypes),
    required: true,
  },
}, { timestamps: true });

/**
 * @typedef DifferentialScheme
 */
module.exports = mongoose.model('FileUploadSchema', fileUploadSchema);
