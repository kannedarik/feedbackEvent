const logger = require('../../config/logger').logger;
const _ = require('lodash');

const responseHandler = require('../utils/helper');
const responseConst = require('../utils/constants/response');

const LenderAccountService = require('../services/lenderaccountdetails.service');

exports.create = async (req, res, next) => {
  let response = {};
  try {
    const { lenderId, accountId } = req.body;
    if (_.isEmpty(lenderId) || _.isEmpty(accountId)) {
      let responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.BadParams, 'Mandatory params are missing');
      return res.status(responseObj.status).send(responseObj);
    }
    let lender = { lenderId: lenderId, accountId: accountId };
    response = await LenderAccountService.createLenderAccount(lender);
    logger.info('Lender created in db', response);
    let responseObj = await responseHandler.getSuccessResponse(responseConst.successCodes.LenderCreated, response);
    return res.status(responseObj.status).send(responseObj);
  }
  catch (error) {
    logger.error('Error occurred in creating lender account:', error);
    responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.Exception);
  }
  return res.status(responseObj.status).send(responseObj);
};

exports.getAllLenders = async (req, res, next) => {
  try {
    let lenders = await LenderAccountService.getAllLendersAccount();
    logger.info('Fetched lenders from db', lenders);
    if (lenders.length > 0) {
      let responseObj = await responseHandler.getSuccessResponse(responseConst.successCodes.Default, lenders);
      return res.status(responseObj.status).send(responseObj);
    }
    let responseObj = await responseHandler.getSuccessResponse(responseConst.successCodes.Default, lenders, 'No lenders were found');
    return res.status(responseObj.status).send(responseObj);
  }
  catch (error) {
    logger.error('Error occurred in fetching lender account details:', error);
    let responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.Exception);
    return res.status(responseObj.status).send(responseObj);
  }
}

exports.getLenderDetails = async (req, res, next) => {
  const { lenderId } = req.params;
  try {
    let lenders = await LenderAccountService.getAllAccountsForLender(lenderId);
    logger.info('Fetched lenders from db', lenders);
    if (lenders.length > 0) {
      let responseObj = await responseHandler.getSuccessResponse(responseConst.successCodes.Default, lenders);
      return res.status(responseObj.status).send(responseObj);
    }
    let responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.LenderNotFound);
    return res.status(responseObj.status).send(responseObj);
  }
  catch (error) {
    logger.error('Error occurred in fetching all lender account details:', error);
    let responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.Exception);
    return res.status(responseObj.status).send(responseObj);
  }
}

exports.delete = async (req, res, next) => {
  try {
    const { lenderId, accountId } = req.body;
    if (_.isEmpty(lenderId) || _.isEmpty(accountId)) {
      let responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.BadParams, 'Mandatory params are missing');
      return res.status(responseObj.status).send(responseObj);
    }
    let lender = { lenderId: lenderId, accountId: accountId };
    let response = await LenderAccountService.deleteLenderAccount(lender);
    if (response > 0) {
      logger.info('Lender deleted from db', lender);
      let responseObj = await responseHandler.getSuccessResponse(responseConst.successCodes.LenderDeleted);
      return res.status(responseObj.status).send(responseObj);
    }
    let responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.LenderNotFound, 'No lenders were found');
    return res.status(responseObj.status).send(responseObj);
  }
  catch (error) {
    logger.error('Error occurred in deleting lender account details:', error);
    let responseObj = await responseHandler.getErrorResponse(responseConst.errorCodes.Exception);
    return res.status(responseObj.status).send(responseObj);
  }
};
