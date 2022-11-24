const httpStatus = require('http-status');
const SNSService = require('../services/sns.service');
const { logger } = require('../../config/logger');
const { awsConfig } = require('../../config/vars');

/**
 * Razorpay Webhook
 * @public
 */
exports.razorpay = async (req, res, next) => {
  try {
    logger.info('Razorpay Webhook', req.body);

    await SNSService.publish({
      topic: awsConfig.sns.topic,
      message: req.body,
      attributes: {
        service: {
          DataType: 'String',
          StringValue: 'razorpay',
        },
      },
    });
    return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Data received successfully' });
  } catch (error) {
    return next(error);
  }
};

/**
 * Leegality Webhook
 * @public
 */
exports.leegality = async (req, res, next) => {
  try {
    await SNSService.publish({
      topic: awsConfig.sns.topic,
      message: req.body,
      attributes: {
        service: {
          DataType: 'String',
          StringValue: 'leegality',
        },
      },
    });
    return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Data received successfully' });
  } catch (error) {
    return next(error);
  }
};

/**
 * Kaleyra Webhook
 * @public
 */
exports.kaleyra = async (req, res, next) => {
  try {
    await SNSService.publish({
      topic: awsConfig.sns.topic,
      message: req.query,
      attributes: {
        service: {
          DataType: 'String',
          StringValue: 'kaleyra',
        },
      },
    });
    return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Data received successfully' });
  } catch (error) {
    return next(error);
  }
};

/**
 * Twilio Webhook
 * @public
 */
exports.twilio = async (req, res, next) => {
  try {
    await SNSService.publish({
      topic: awsConfig.sns.topic,
      message: req.body,
      attributes: {
        service: {
          DataType: 'String',
          StringValue: 'twilio',
        },
      },
    });
    return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Data received successfully' });
  } catch (error) {
    return next(error);
  }
};

/**
 * 2factor Webhook
 * @public
 */
exports.twofactor = async (req, res, next) => {
  try {
    await SNSService.publish({
      topic: awsConfig.sns.topic,
      message: req.body,
      attributes: {
        service: {
          DataType: 'String',
          StringValue: 'twofactor',
        },
      },
    });
    return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Data received successfully' });
  } catch (error) {
    return next(error);
  }
};

/**
 * 2factor Webhook
 * @public
 */
exports.payment = async (req, res, next) => {
  try {
    await SNSService.publish({
      topic: awsConfig.sns.topic,
      message: req.body,
      attributes: {
        service: {
          DataType: 'String',
          StringValue: 'payment',
        },
      },
    });
    return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Data received successfully' });
  } catch (error) {
    return next(error);
  }
};

/**
 * OMS DocSign Webhook
 * @public
 */
exports.omsSigning = async (req, res, next) => {
  try {
    await SNSService.publish({
      topic: awsConfig.sns.topic,
      message: req.body,
      attributes: {
        service: {
          DataType: 'String',
          StringValue: 'oms/docsign',
        },
      },
    });
    return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Data received successfully' });
  } catch (error) {
    return next(error);
  }
};
