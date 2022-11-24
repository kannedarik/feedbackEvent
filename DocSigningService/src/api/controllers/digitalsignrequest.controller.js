const httpStatus = require('http-status');
const DigitalSignProvider = require('../models/digitalsignprovider.model');
const DigitalSignRequest = require('../models/digitalsignrequest.model');
const SigningRequest = require('../models/signingrequest.model');
const SigningStatus = require('../models/signingstatus.model');
const SigningType = require('../models/signingtype.model');

/**
 * Create DigitalSignProvider
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const [provider, type] = await Promise.all([
      DigitalSignProvider.findOne({
        _id: req.body.provider,
        archived: false,
      }),
      SigningType.findOne({
        _id: req.body.type,
        archived: false,
      }),
    ]);
    if (!provider || !type) {
      return res.status(httpStatus.BAD_REQUEST).json({ code: httpStatus.BAD_REQUEST, message: 'Signing Provider/Type invalid' });
    }

    const statuses = await SigningStatus.find({
      name: { $in: ['created', 'processing', 'cancelled'] },
      archived: false,
    });
    const statusMap = statuses.reduce((result, item) => {
      result[item.name] = item.id; // eslint-disable-line no-param-reassign
      return result;
    }, {});

    await SigningRequest.cancelRequest(req.body, statusMap);
    const signingrequest = await DigitalSignRequest.createRequest({
      ...req.body, client: req.user.id,
    }, provider, statusMap);

    return res.status(httpStatus.CREATED).json({
      code: httpStatus.CREATED,
      message: 'DigitalSign Request created successfully',
      request: {
        id: signingrequest._id,
        otp: signingrequest.otp,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get/Resend OTP
 * @public
 */
exports.otp = async (req, res, next) => {
  try {
    const provider = await DigitalSignProvider.findOne({
      _id: req.body.provider,
      archived: false,
    });
    if (!provider) {
      return res.status(httpStatus.BAD_REQUEST).json({ code: httpStatus.BAD_REQUEST, message: 'Signing Provider invalid' });
    }

    const statuses = await SigningStatus.find({
      name: { $in: ['created', 'processing'] },
      archived: false,
    });
    const statusMap = statuses.reduce((result, item) => {
      result[item.name] = item.id; // eslint-disable-line no-param-reassign
      return result;
    }, {});

    const signingrequest = await DigitalSignRequest.findOne({
      _id: req.params.id,
      status: { $in: [statusMap.created, statusMap.processing] },
    });

    if (signingrequest) {
      await signingrequest.updateRequest(provider);
      return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'DigitalSign OTP sent' });
    }

    return res.status(httpStatus.NOT_FOUND).json({ code: httpStatus.NOT_FOUND, message: 'DigitalSign Request not found or already processed' });
  } catch (error) {
    return next(error);
  }
};

/**
 * Verify DigitalSignProvider
 * @public
 */
exports.verify = async (req, res, next) => {
  try {
    const statuses = await SigningStatus.find({
      name: { $in: ['created', 'processing', 'success', 'failure'] },
      archived: false,
    });
    const statusMap = statuses.reduce((result, item) => {
      result[item.name] = item.id; // eslint-disable-line no-param-reassign
      return result;
    }, {});

    const signingrequest = await DigitalSignRequest.findOne({
      _id: req.params.id,
      status: { $in: [statusMap.created, statusMap.processing] },
    }).populate('provider type');

    if (signingrequest) {
      const transformedData = await DigitalSignRequest.verifyRequest(signingrequest, req.body, statusMap); // eslint-disable-line max-len
      return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'DigitalSign Request processed successfully', request: transformedData });
    }
    return res.status(httpStatus.NOT_FOUND).json({ code: httpStatus.NOT_FOUND, message: 'DigitalSign Request not found or already processed' });
  } catch (error) {
    return next(error);
  }
};
