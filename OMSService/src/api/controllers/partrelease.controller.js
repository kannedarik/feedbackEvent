const httpStatus = require('http-status');
const _ = require('lodash');
const ZeebeService = require('../services/zeebe.service');
const { workflowIds } = require('../utils/constants');
const { logger } = require('../../config/logger');

exports.create = async (req, res, next) => {
  try {
    const payload = _.merge(
      req.body,
      req.body.isJewelExport,
      { isJewelExport: Boolean(req.body.isJewelExport) },
    );
    await ZeebeService.createWorkflowInstance(workflowIds.partrelease.caseCreation, { ...payload });
    return res.status(httpStatus.CREATED).json({
      code: httpStatus.CREATED,
      message: 'Case created successfully in salesforce',
    });
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.slot = async (req, res, next) => {
  try {
    await ZeebeService.createWorkflowInstance(workflowIds.partrelease.confirmSlot, {
      ...req.body,
      token: req.user.token,
    });
    return res.status(httpStatus.CREATED).json({
      code: httpStatus.CREATED,
      message: 'Slot booking request placed successfully',
    });
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
