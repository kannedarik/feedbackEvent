const httpStatus = require('http-status');
const moment = require('moment');
const SigningStatus = require('../models/signingstatus.model');

/**
 * Create SigningStatus
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const signingstatus = await SigningStatus.create(req.body);
    return res.status(httpStatus.CREATED).json({ code: httpStatus.CREATED, message: 'Signing Status created successfully', status: signingstatus });
  } catch (error) {
    return next(error);
  }
};

/**
 * Read SigningStatus
 * @public
 */
exports.read = async (req, res, next) => {
  try {
    const signingstatus = await SigningStatus.findOne({ _id: req.params.id, archived: false });

    if (signingstatus) {
      return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Signing Status fetched successfully', status: signingstatus });
    }
    return res.status(httpStatus.NOT_FOUND).json({ code: httpStatus.NOT_FOUND, message: 'Resource not found' });
  } catch (error) {
    return next(error);
  }
};

/**
 * List SigningStatus
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const signingstatues = await SigningStatus.find({ archived: false });

    return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Signing Status(es) fetched successfully', statuses: signingstatues });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update SigningStatus
 * @public
 */
exports.update = async (req, res, next) => {
  try {
    const signingstatus = await SigningStatus.findOneAndUpdate({
      _id: req.params.id,
      archived: false,
    }, req.body, {
      new: true,
    });

    if (signingstatus) {
      return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Signing Status updated successfully', status: signingstatus });
    }
    return res.status(httpStatus.NOT_FOUND).json({ code: httpStatus.NOT_FOUND, message: 'Resource not found' });
  } catch (error) {
    return next(error);
  }
};

/**
 * Delete SigningStatus
 * @public
 */
exports.delete = async (req, res, next) => {
  try {
    const signingstatus = await SigningStatus.findOneAndUpdate({
      _id: req.params.id,
      archived: false,
    }, {
      archived: true,
      archivedAt: moment().toISOString(),
    });

    if (signingstatus) {
      return res.status(httpStatus.NO_CONTENT);
    }
    return res.status(httpStatus.NOT_FOUND).json({ code: httpStatus.NOT_FOUND, message: 'Resource not found' });
  } catch (error) {
    return next(error);
  }
};
