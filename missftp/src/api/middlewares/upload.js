const { includes } = require('lodash');
const httpStatus = require('http-status');
const multer = require('multer');
const APIError = require('../utils/APIError');

exports.upload = allowedFileTypes => (req, res, next) => {
  multer({
    fileFilter: (request, file, cb) => {
      if (!includes(allowedFileTypes, file.mimetype)) {
        const apiError = new APIError({
          status: httpStatus.BAD_REQUEST,
          message: 'Only allowed format can be uploaded',
        });
        return cb(apiError);
      }
      return cb(null, true);
    },
  }).single('file')(req, res, next);
};
