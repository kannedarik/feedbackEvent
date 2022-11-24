const _ = require('lodash');
const sprintf = require('sprintf').sprintf;
const httpStatus = require('http-status');

const responseConstant = require('../utils/constants/response');

let getErrorResponse = async (err, errorObj, errorResponse) => {
  let errorCode = Object.entries(responseConstant.errorCodes).find(e => e[1] === err);
  if (errorCode) {
    let errorCodeDesc = responseConstant.error[errorCode[0]];
    let errorDesc = responseConstant.errorMsg[errorCode[0]];
    if (errorObj)
      errorDesc = sprintf(errorObj, errorDesc);
    let httpCode = responseConstant.errorToHttpStatusMap[errorCode[0]];
    if (!httpCode)
      httpCode = responseConstant.errorToHttpStatusMap.Exception;
    return new Object({
      'error': {
        'error_code': err,
        'error_code_desc': errorCodeDesc,
        'error_message': errorDesc
      },
      'status': httpCode,
      'response': errorResponse
    });
  } else {
    return new Object({
      'error': {
        'errorCode': responseConstant.errorCodes.Exception,
        'error_code_desc': responseConstant.errorMsg.Exception
      },
      'status': responseConstant.errorToHttpStatusMap.Exception,
      'response': null
    })
  }
}

let getSuccessResponse = async (code, obj, message) => {
  let successCode = Object.entries(responseConstant.successCodes).find(e => e[1] === code);
  let httpCode = responseConstant.successToHttpStatusMap[successCode[0]];
  if (!message)
    message = responseConstant.success[successCode[0]];
  if (!obj)
    obj = [];
  //message = await sails.helpers.mustacheParser(message, obj);
  if (!httpCode)
    httpCode = responseConstant.successCodes.Default;
  return new Object({
    'status': httpCode,
    'response': obj,
    'message': message
  });
}

module.exports = {
  getErrorResponse,
  getSuccessResponse
}
