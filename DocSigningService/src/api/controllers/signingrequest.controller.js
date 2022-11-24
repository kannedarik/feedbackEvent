const httpStatus = require('http-status');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const SigningRequest = require('../models/signingrequest.model');
const SigningStatus = require('../models/signingstatus.model');

/**
 * List ESignSignRequest
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const statuses = await SigningStatus.find({
      name: { $in: ['processing', 'success', 'failure', 'cancelled'] },
      archived: false,
    });
    const statusMap = statuses.reduce((result, item) => {
      result[item.name] = item.id; // eslint-disable-line no-param-reassign
      return result;
    }, {});

    const signingrequests = await SigningRequest
      .find({
        ...req.query,
        ...(req.query.type && { type: mongoose.Types.ObjectId(req.query.type) }),
        client: req.user.id,
        status: { $ne: statusMap.cancelled },
      })
      .populate('document status provider type');
    const transformedData = await Promise.map(signingrequests, (request) => request.processRequest(statusMap)); // eslint-disable-line max-len

    return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Signing Request(s) fetched successfully', requests: transformedData });
  } catch (error) {
    return next(error);
  }
};
