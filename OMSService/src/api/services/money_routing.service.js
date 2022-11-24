const axios = require('axios');
const httpStatus = require('http-status');
const APIError = require('../utils/APIError');
const { services } = require('../../config/vars');
const Constants = require('../utils/constants');

const PENNY_TESTING = 'PENNY_TESTING';

const url = (route) => `${services.money_routing.endpoint}${services.money_routing[route]}`;

const api = async (options) => {
  try {
    const response = await axios({
      ...options,
      auth: {
        username: services.money_routing.credentials.username,
        password: services.money_routing.credentials.password,
      },
    });
    return response.data;
  } catch (e) {
    throw new APIError({
      status: (e.response ? e.response.status : httpStatus.INTERNAL_SERVER_ERROR),
      message: ((e.response && e.response.data) ? (e.response.data.ErrorMsg || e.response.data.UserMsg) : e.message), // eslint-disable-line max-len
    });
  }
};

const initiatePennyTesting = async (customer, bankDetails, referenceId) => {
  const options = {
    url: url('initiatePennyTesting'),
    method: 'POST',
    data: {
      referenceId,
      bankDetails,
      verificationMode: PENNY_TESTING,
      phoneNumber: customer.phone,
      customerId: customer.id,
      city: customer.cityid.toString(),
    },
  };
  return api(options);
};

const listBankAccounts = async (customer, verified = false) => {
  const options = {
    url: url('listBankAccounts'),
    method: 'GET',
    params: { customerId: customer.id, verificationMode: PENNY_TESTING, verified },
  };
  return api(options);
};

const getBankAccountDetails = async (accountNumber, verified = false) => {
  const options = {
    url: url('listBankAccounts'),
    method: 'GET',
    params: { accountNumber, verificationMode: PENNY_TESTING, verified },
  };
  return api(options);
};
const resendOTP = async (transactionId, type = Constants.smsType.SMS) => {
  const options = {
    url: url('resendOTP'),
    method: 'POST',
    data: { transactionId, type },
  };
  return api(options);
};

const verifyOTP = async (transactionId, otp) => {
  const options = {
    url: url('verifyOTP'),
    method: 'GET',
    params: { transactionId, otp },
  };
  return api(options);
};

const transactionStatus = async (transactionId) => {
  const transactionStatusURL = `${services.money_routing.endpoint}${services.money_routing.transactionStatus}${transactionId}`;
  const options = {
    url: transactionStatusURL,
    method: 'GET',
  };
  return api(options);
};

module.exports = {
  initiatePennyTesting,
  listBankAccounts,
  resendOTP,
  verifyOTP,
  transactionStatus,
  getBankAccountDetails,
};
