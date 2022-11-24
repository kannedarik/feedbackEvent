const httpStatus = require('http-status');
const ESignProvider = require('../models/esignprovider.model');
const ESignRequest = require('../models/esignrequest.model');
const SigningRequest = require('../models/signingrequest.model');
const SigningStatus = require('../models/signingstatus.model');
const SigningType = require('../models/signingtype.model');

/**
 * Create ESignSignRequest
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const [provider, type] = await Promise.all([
      ESignProvider.findOne({
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
    const signingrequest = await ESignRequest.createRequest({
      ...req.body, client: req.user.id,
    }, provider, statusMap);

    return res.status(httpStatus.CREATED).json({
      code: httpStatus.CREATED,
      message: 'ESign Request created successfully',
      request: {
        id: signingrequest._id,
        url: signingrequest.signurl,
      },
    });
  } catch (error) {
    return next(error);
  }
};
