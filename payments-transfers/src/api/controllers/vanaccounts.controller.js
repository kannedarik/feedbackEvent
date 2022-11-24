const logger = require('../../config/logger').logger;
const _ = require('lodash');

const responseHandler = require('../utils/helper');
const responseConst = require('../utils/constants/response');

const VanAccountService = require('../services/vanaccount.service');

exports.create = async (req, res, next) => {
  let responseObj = {};
  const { accountId, accountNo } = req.body;
  try {
    if (_.isEmpty(accountId) || _.isEmpty(accountNo)) {
      responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.BadParams, 'Mandatory params are missing');
      return res.status(responseObj.status).send(responseObj);
    }
    let vanaccount = { accountNo: accountNo, accountId: accountId };
    let vanCreationResponse = await VanAccountService.createVanAccount(vanaccount);
    let logmsg = { "vanaccountno": accountNo, "values": vanCreationResponse };
    logger.info('Van account created', logmsg);
    responseObj = await responseHandler.getSuccessResponse(responseConst.successCodes.VanAccountCreated, vanCreationResponse);
  }
  catch (error) {
    logger.error('Error occurred in creating van account:', error);
    responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.Exception);
  }
  return res.status(responseObj.status).send(responseObj);
};

exports.getAllAccounts = async (req, res, next) => {
  let responseObj = {};
  try {
    let vanaccounts = await VanAccountService.getAllVanAccounts();
    logger.info('Fetched van accounts from db', vanaccounts);
    if (!_.isEmpty(vanaccounts)) {
      responseObj = await responseHandler.getSuccessResponse(responseConst.successCodes.Default, vanaccounts);
    }
    else
      responseObj = await responseHandler.getSuccessResponse(responseConst.successCodes.Default, "", 'No van accounts found');
  }
  catch (error) {
    logger.error('Error occurred in fetching all van accounts:', error);
    responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.Exception);
  }
  return res.status(responseObj.status).send(responseObj);
}

exports.getVanAccountId = async (req, res, next) => {
  const { accountno } = req.params;
  let responseObj = {};
  try {
    let vanaccount = await VanAccountService.getVanAccountId(accountno);
    logger.info('Fetched van account from db', vanaccounts);
    if (!_.isEmpty(vanaccount)) {
      responseObj = await responseHandler.getSuccessResponse(responseConst.successCodes.Default, vanaccount);
    }
    else
      responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.VanAccountNotFound);
  }
  catch (error) {
    logger.error('Error occurred in fetching account no:', error);
    responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.Exception);
  }
  return res.status(responseObj.status).send(responseObj);
}

exports.delete = async (req, res, next) => {
  let responseObj = {};
  const { accountno } = req.params;
  try {
    if (_.isEmpty(accountno)) {
      responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.BadParams, 'Mandatory params are missing');
      return res.status(responseObj.status).send(responseObj);
    }
    let response = await VanAccountService.deleteVanAccount(accountno);
    if (response > 0) {
      logger.info('Van account deleted from db', { "vanaccountno": accountno });
      responseObj = await responseHandler.getSuccessResponse(responseConst.successCodes.VanAccountDeleted);
    }
    else
      responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.VanAccountNotFound, 'No van account was found');
  }
  catch (error) {
    logger.error('Error occurred in deleting van account:', error);
    responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.Exception);
  }
  return res.status(responseObj.status).send(responseObj);
};

exports.update = async (req, res, next) => {
  let responseObj = {};
  const { accountId, accountNo } = req.body;
  try {
    if (_.isEmpty(accountNo) || _.isEmpty(accountId)) {
      responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.BadParams, 'Mandatory params are missing');
      return res.status(responseObj.status).send(responseObj);
    }
    let vanaccount = { accountNo: accountNo, accountId: accountId };
    let response = await VanAccountService.updateVanAccount(vanaccount);
    if (response > 0) {
      logger.info('Van account updated', vanaccount);
      responseObj = await responseHandler.getSuccessResponse(responseConst.successCodes.VanAccountUpdated, vanaccount);
    }
    else {
      logger.info('Van account not updated', vanaccount);
      responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.Exception);
    }
  }
  catch (error) {
    logger.error('Error occurred in updating van payment:', error);
    responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.Exception);
  }
  return res.status(responseObj.status).send(responseObj);
};
