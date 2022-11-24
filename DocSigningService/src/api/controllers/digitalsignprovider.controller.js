const httpStatus = require('http-status');
const moment = require('moment');
const DigitalSignProvider = require('../models/digitalsignprovider.model');
const SigningType = require('../models/signingtype.model');

/**
 * Create DigitalSignProvider
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const signingtype = await SigningType.findOne({ name: 'digital', archived: false });
    const digitalsignprovider = await DigitalSignProvider.create({
      ...req.body,
      type: signingtype.id,
    });

    return res.status(httpStatus.CREATED).json({ code: httpStatus.CREATED, message: 'DigitalSign Provider created successfully', provider: digitalsignprovider });
  } catch (error) {
    return next(error);
  }
};

/**
 * Read DigitalSignProvider
 * @public
 */
exports.read = async (req, res, next) => {
  try {
    const digitalsignprovider = await DigitalSignProvider.findOne({
      _id: req.params.id,
      archived: false,
    }).populate('type');

    if (digitalsignprovider) {
      return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'DigitalSign Provider fetched successfully', provider: digitalsignprovider });
    }
    return res.status(httpStatus.NOT_FOUND).json({ code: httpStatus.NOT_FOUND, message: 'Resource not found' });
  } catch (error) {
    return next(error);
  }
};

/**
 * List DigitalSignProvider
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const digitalsignproviders = await DigitalSignProvider.find({ archived: false }).populate('type');

    return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'DigitalSign Provider(s) fetched successfully', providers: digitalsignproviders });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update DigitalSignProvider
 * @public
 */
exports.update = async (req, res, next) => {
  try {
    const digitalsignprovider = await DigitalSignProvider.findOneAndUpdate({
      _id: req.params.id,
      archived: false,
    }, req.body, {
      new: true,
    });

    if (digitalsignprovider) {
      return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'DigitalSign Provider updated successfully', provider: digitalsignprovider });
    }
    return res.status(httpStatus.NOT_FOUND).json({ code: httpStatus.NOT_FOUND, message: 'Resource not found' });
  } catch (error) {
    return next(error);
  }
};

/**
 * Delete DigitalSignProvider
 * @public
 */
exports.delete = async (req, res, next) => {
  try {
    const digitalsignprovider = await DigitalSignProvider.findOneAndUpdate({
      _id: req.params.id,
      archived: false,
    }, {
      archived: true,
      archivedAt: moment().toISOString(),
    });

    if (digitalsignprovider) {
      return res.status(httpStatus.NO_CONTENT);
    }
    return res.status(httpStatus.NOT_FOUND).json({ code: httpStatus.NOT_FOUND, message: 'Resource not found' });
  } catch (error) {
    return next(error);
  }
};
