const httpStatus = require('http-status');
const moment = require('moment');
const SigningType = require('../models/signingtype.model');

/**
 * Create SigningType
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const signingtype = await SigningType.create(req.body);
    return res.status(httpStatus.CREATED).json({ code: httpStatus.CREATED, message: 'Signing Type created successfully', type: signingtype });
  } catch (error) {
    return next(error);
  }
};

/**
 * Read SigningType
 * @public
 */
exports.read = async (req, res, next) => {
  try {
    const signingtype = await SigningType.findOne({ _id: req.params.id, archived: false });

    if (signingtype) {
      return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Signing Type fetched successfully', type: signingtype });
    }
    return res.status(httpStatus.NOT_FOUND).json({ code: httpStatus.NOT_FOUND, message: 'Resource not found' });
  } catch (error) {
    return next(error);
  }
};

/**
 * List SigningType
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const signingtypes = await SigningType.find({ archived: false });

    return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Signing Type(s) fetched successfully', types: signingtypes });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update SigningType
 * @public
 */
exports.update = async (req, res, next) => {
  try {
    const signingtype = await SigningType.findOneAndUpdate({
      _id: req.params.id,
      archived: false,
    }, req.body, {
      new: true,
    });

    if (signingtype) {
      return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Signing Type updated successfully', type: signingtype });
    }
    return res.status(httpStatus.NOT_FOUND).json({ code: httpStatus.NOT_FOUND, message: 'Resource not found' });
  } catch (error) {
    return next(error);
  }
};

/**
 * Delete SigningType
 * @public
 */
exports.delete = async (req, res, next) => {
  try {
    const signingtype = await SigningType.findOneAndUpdate({
      _id: req.params.id,
      archived: false,
    }, {
      archived: true,
      archivedAt: moment().toISOString(),
    });

    if (signingtype) {
      return res.status(httpStatus.NO_CONTENT);
    }
    return res.status(httpStatus.NOT_FOUND).json({ code: httpStatus.NOT_FOUND, message: 'Resource not found' });
  } catch (error) {
    return next(error);
  }
};
