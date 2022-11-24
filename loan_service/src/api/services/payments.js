const { isEmpty } = require('lodash');
const axios = require('axios');
const httpStatus = require('http-status');
const { urls } = require('../../config/vars');
const { logger } = require('../../config/logger');
const APIError = require('../utils/APIError');


/**
 * Get loans data from payment
 */
exports.userloans = async (token) => {
  try {
    const options = {
      method: 'GET',
      url: `${urls.payments.endpoint}${urls.payments.userloans}`,
      headers: {
        Authorization: `JWT ${token}`,
      },
    };
    logger.info('calling get userloans api with options:', options);
    const response = await axios(options);
    logger.info('fetched userloans from payments', response.data);
    return response.data;
  } catch (e) {
    logger.error('error occurred while calling userloans api', e);
    throw new APIError({
      status: (e.response ? e.response.status : httpStatus.INTERNAL_SERVER_ERROR),
      message: (e.response ? (e.response.Error || e.response.Usermsg) : e.message),
    });
  }
};

/**
 * Get customer loans data from payment
 */
exports.loans = async (token, phone) => {
  try {
    const options = {
      method: 'GET',
      url: `${urls.payments.endpoint}${urls.payments.loans}/${phone}`,
      headers: {
        Authorization: `JWT ${token}`,
      },
    };
    logger.info('calling get loans api with options:', options);
    const response = await axios(options);
    logger.info('fetched loans from payments', response.data);
    return response.data;
  } catch (e) {
    logger.error('error occurred while calling loans api', e);
    throw new APIError({
      status: (e.response ? e.response.status : httpStatus.INTERNAL_SERVER_ERROR),
      message: (e.response ? (e.response.Error || e.response.Usermsg) : e.message),
    });
  }
};

/**
 * Get customer loans data from payment
 */
exports.customerloans = async (token, phone) => {
  try {
    const options = {
      method: 'GET',
      url: `${urls.payments.endpoint}${urls.payments.customerloans}?phone=${phone}`,
      headers: {
        Authorization: `JWT ${token}`,
      },
    };
    logger.info('calling customerloans api  with options:', options);
    const response = await axios(options);
    logger.info('fetched customerloans from payments', response.data);
    return response.data;
  } catch (e) {
    logger.error('error occurred while calling customerloans api', e);
    throw new APIError({
      status: (e.response ? e.response.status : httpStatus.INTERNAL_SERVER_ERROR),
      message: (e.response ? (e.response.Error || e.response.Usermsg) : e.message),
    });
  }
};

exports.supportuserloans = async (token, userid) => {
  try {
    const options = {
      method: 'GET',
      url: `${urls.payments.endpoint}${urls.payments.supportuserloans}`,
      headers: {
        Authorization: `JWT ${token}`,
      },
      params: {
        id: userid,
      },
    };
    logger.info('calling supportuserloans api with options:', options);
    const response = await axios(options);
    logger.info('fetched supportuserloans from payments', response.data);
    return response.data;
  } catch (e) {
    logger.error('error occurred while calling supportuserloans api', e);
    throw new APIError({
      status: (e.response ? e.response.status : httpStatus.INTERNAL_SERVER_ERROR),
      message: (e.response ? (e.response.Error || e.response.Usermsg) : e.message),
    });
  }
};

exports.paymentsLoanData = async (token, lmsids) => {
  try {
    const options = {
      method: 'GET',
      url: `${urls.payments.endpoint}${urls.payments.loandetails}`,
      headers: {
        Authorization: `JWT ${token}`,
      },
      params: {
        loanids: lmsids.join(','),
      },
    };
    logger.info('calling payment-service to fetch loans from loan-payment', options);
    const response = await axios(options);
    logger.info('fetched loans from paymentservice loan-payment', response.data);
    return response.data;
  } catch (e) {
    logger.error('error occurred while calling payment loandetails api', e);
    throw new APIError({
      status: (e.response ? e.response.status : httpStatus.INTERNAL_SERVER_ERROR),
      message: (e.response ? (e.response.Error || e.response.Usermsg) : e.message),
    });
  }
};

exports.aggregateloanjewels = async (token, phone) => {
  try {
    const options = {
      method: 'GET',
      url: `${urls.payments.endpoint}${urls.payments.aggregateloanjewels}`,
      headers: {
        Authorization: `JWT ${token}`,
      },
      params: {
        id: phone,
      },
    };
    logger.info('calling aggregateloansjewels api with options', options);
    const response = await axios(options);
    logger.info('fetched aggregateloanjewels from paymentservice', response.data);
    return response.data;
  } catch (e) {
    logger.error('error occurred while calling  aggregateloanjewels api', e);
    throw new APIError({
      status: (e.response ? e.response.status : httpStatus.INTERNAL_SERVER_ERROR),
      message: (e.response ? (e.response.Error || e.response.Usermsg) : e.message),
    });
  }
};

exports.getUserLoansStatus = async (token) => {
  try {
    const options = {
      method: 'GET',
      url: `${urls.payments.endpoint}${urls.payments.getUserLoansStatus}`,
      headers: {
        Authorization: `JWT ${token}`,
      },
    };
    logger.info('Fetching user loan statuses', options);
    const response = await axios(options);
    logger.info('Fetched user loan statuses', response.data);
    return response.data.response;
  } catch (e) {
    logger.error('Error while fetching user loan statuses', e);
    throw new APIError({
      status: (e.response ? e.response.status : httpStatus.INTERNAL_SERVER_ERROR),
      message: (e.response ? (e.response.Error || e.response.Usermsg) : e.message),
    });
  }
};

const getRenewalLoans = async (token, filter) => {
  const options = {
    method: 'POST',
    url: `${urls.payments.endpoint}${urls.payments.renewalLoans}`,
    headers: {
      Authorization: `JWT ${token}`,
    },
    params: filter,
  };
  logger.info('calling payment renewalLoans api with options:', options);
  const response = await axios(options);
  logger.info('fetched renewalLoans from payments', response.data);
  return response.data.response;
};

exports.renewalLoans = async (token, filter) => {
  let loans = [];
  let pageNo = 0;
  let nextPage = true;
  try {
    while (nextPage) {
      // eslint-disable-next-line no-await-in-loop
      const response = await getRenewalLoans(token, { ...filter, pageNumber: pageNo });
      pageNo += 1;
      if (isEmpty(response) || (pageNo >= response.totalPages)) {
        nextPage = false;
      }
      if (!isEmpty(response) && !isEmpty(response.data)) loans = [...loans, ...response.data];
    }
  } catch (e) {
    logger.error('some error occured while fetching payments renewal api', e);
    throw new APIError({
      status: (e.response ? e.response.status : httpStatus.INTERNAL_SERVER_ERROR),
      message: (e.response ? (e.response.Error || e.response.Usermsg) : e.message),
    });
  }
  return loans;
};

exports.listPaymentTransactions = async (token, params) => {
  try {
    const options = {
      method: 'GET',
      url: `${urls.payments.endpoint}${urls.payments.listPaymentTransactions}`,
      headers: {
        Authorization: `JWT ${token}`,
      },
      params,
    };
    logger.info('Fetching loan payment transactions', options);
    const response = await axios(options);
    logger.info('Fetched loan payment transactions', response.data);
    return response.data.response;
  } catch (e) {
    logger.error('Error while fetching loan payment transactions', e);
    return [];
  }
};
