const crypto = require('crypto');
const httpStatus = require('http-status');
const APIError = require('../utils/APIError');
const { razorpay } = require('../../config/vars');

const checkValidation = (signature, body, privatekey) => {
  const key = Buffer.from(privatekey);
  const generatedChecksum = crypto.createHmac('sha256', key).update(JSON.stringify(body)).digest('hex');

  if (generatedChecksum === signature) {
    return true;
  }
  return false;
};

exports.authorizeRazorpay = () => (req, res, next) => {
  if (req.headers['x-razorpay-signature']) {
    if (checkValidation(req.headers['x-razorpay-signature'], req.body, razorpay.privatekey)) {
      return next();
    }
    return next(new APIError({
      status: httpStatus.UNAUTHORIZED,
      message: 'You are not allowed to access this resource. Reason: Razorpay signature mismatch.',
    }));
  }
  return next(new APIError({
    status: httpStatus.UNAUTHORIZED,
    message: 'You are not allowed to access this resource. Reason: Razorpay signature not provided.',
  }));
};
