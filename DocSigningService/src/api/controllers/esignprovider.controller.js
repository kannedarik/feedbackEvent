const httpStatus = require('http-status');
const moment = require('moment');
const ESignProvider = require('../models/esignprovider.model');
const SigningType = require('../models/signingtype.model');

/**
 * Create ESignProvider
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const signingtype = await SigningType.findOne({ name: 'esign', archived: false });
    const esignprovider = await ESignProvider.create({ ...req.body, type: signingtype.id });

    return res.status(httpStatus.CREATED).json({ code: httpStatus.CREATED, message: 'ESign Provider created successfully', provider: esignprovider });
  } catch (error) {
    return next(error);
  }
};

/**
 * Read ESignProvider
 * @public
 */
exports.read = async (req, res, next) => {
  try {
    const esignprovider = await ESignProvider.findOne({
      _id: req.params.id,
      archived: false,
    }).populate('type');

    if (esignprovider) {
      return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'ESign Provider fetched successfully', provider: esignprovider });
    }
    return res.status(httpStatus.NOT_FOUND).json({ code: httpStatus.NOT_FOUND, message: 'Resource not found' });
  } catch (error) {
    return next(error);
  }
};

/**
 * List ESignProvider
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const esignproviders = await ESignProvider.find({ archived: false }).populate('type');

    return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'ESign Provider(s) fetched successfully', providers: esignproviders });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update ESignProvider
 * @public
 */
exports.update = async (req, res, next) => {
  try {
    const esignprovider = await ESignProvider.findOneAndUpdate({
      _id: req.params.id,
      archived: false,
    }, req.body, {
      new: true,
    });

    if (esignprovider) {
      return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'ESign Provider updated successfully', provider: esignprovider });
    }
    return res.status(httpStatus.NOT_FOUND).json({ code: httpStatus.NOT_FOUND, message: 'Resource not found' });
  } catch (error) {
    return next(error);
  }
};

/**
 * Delete ESignProvider
 * @public
 */
exports.delete = async (req, res, next) => {
  try {
    const esignprovider = await ESignProvider.findOneAndUpdate({
      _id: req.params.id,
      archived: false,
    }, {
      archived: true,
      archivedAt: moment().toISOString(),
    });

    if (esignprovider) {
      return res.status(httpStatus.NO_CONTENT);
    }
    return res.status(httpStatus.NOT_FOUND).json({ code: httpStatus.NOT_FOUND, message: 'Resource not found' });
  } catch (error) {
    return next(error);
  }
};
