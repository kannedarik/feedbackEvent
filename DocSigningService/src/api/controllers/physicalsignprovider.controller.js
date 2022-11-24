const httpStatus = require('http-status');
const moment = require('moment');
const PhysicalSignProvider = require('../models/physicalsignprovider.model');
const SigningType = require('../models/signingtype.model');

/**
 * Create PhysicalSignProvider
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const signingtype = await SigningType.findOne({ name: 'physical', archived: false });
    const physicalsignprovider = await PhysicalSignProvider.create({
      ...req.body,
      type: signingtype.id,
    });

    return res.status(httpStatus.CREATED).json({ code: httpStatus.CREATED, message: 'PhysicalSign Provider created successfully', provider: physicalsignprovider });
  } catch (error) {
    return next(error);
  }
};

/**
 * Read PhysicalSignProvider
 * @public
 */
exports.read = async (req, res, next) => {
  try {
    const physicalsignprovider = await PhysicalSignProvider.findOne({
      _id: req.params.id,
      archived: false,
    }).populate('type');

    if (physicalsignprovider) {
      return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'PhysicalSign Provider fetched successfully', provider: physicalsignprovider });
    }
    return res.status(httpStatus.NOT_FOUND).json({ code: httpStatus.NOT_FOUND, message: 'Resource not found' });
  } catch (error) {
    return next(error);
  }
};

/**
 * List PhysicalSignProvider
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const physicalsignproviders = await PhysicalSignProvider.find({ archived: false }).populate('type');

    return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'PhysicalSign Provider(s) fetched successfully', providers: physicalsignproviders });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update PhysicalSignProvider
 * @public
 */
exports.update = async (req, res, next) => {
  try {
    const physicalsignprovider = await PhysicalSignProvider.findOneAndUpdate({
      _id: req.params.id,
      archived: false,
    }, req.body, {
      new: true,
    });

    if (physicalsignprovider) {
      return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'PhysicalSign Provider updated successfully', provider: physicalsignprovider });
    }
    return res.status(httpStatus.NOT_FOUND).json({ code: httpStatus.NOT_FOUND, message: 'Resource not found' });
  } catch (error) {
    return next(error);
  }
};

/**
 * Delete PhysicalSignProvider
 * @public
 */
exports.delete = async (req, res, next) => {
  try {
    const physicalsignprovider = await PhysicalSignProvider.findOneAndUpdate({
      _id: req.params.id,
      archived: false,
    }, {
      archived: true,
      archivedAt: moment().toISOString(),
    });

    if (physicalsignprovider) {
      return res.status(httpStatus.NO_CONTENT);
    }
    return res.status(httpStatus.NOT_FOUND).json({ code: httpStatus.NOT_FOUND, message: 'Resource not found' });
  } catch (error) {
    return next(error);
  }
};
