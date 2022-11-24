const httpStatus = require('http-status');
const path = require('path');
const ZeebeService = require('../services/zeebe.service');
const { logger } = require('../../config/logger');

/**
 * Deploy Workflow
 * @public
 */
exports.deploy = async (req, res, next) => {
  try {
    logger.info('zeebe deploy call');
    const result = await ZeebeService.deployWorkflow(path.join(__dirname, '../workflows', req.body.filename));
    return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Workflow Deployed', result });
  } catch (error) {
    return next(error);
  }
};

/**
 * Publish Message
 * @public
 */
exports.publish = async (req, res, next) => {
  try {
    await ZeebeService.publishMessage(req.body.corelationkey, req.body.name, req.body.variables);
    return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Message Publish' });
  } catch (error) {
    return next(error);
  }
};
