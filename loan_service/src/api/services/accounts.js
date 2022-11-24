const axios = require('axios');
const {
  isEmpty,
} = require('lodash');
const { urls } = require('../../config/vars');
const { logger } = require('../../config/logger');

/**
 * Get customer-rupeek-view for given lmsids
 */
exports.accountsLoansViews = async (loanids, getLenderDetails, token) => {
  try {
    const options = {
      method: 'GET',
      url: `${urls.accounts.endpoint}${urls.accounts.customerrupeekview}`,
      headers: {
        Authorization: `JWT ${token}`,
      },
      params: {
        lmsIds: loanids.join(','),
        getLenderDetails,
      },
    };
    logger.info('calling account-service api to fetch loans with options:', options);
    const response = await axios(options);
    logger.info('fetched loans from account-service:', response.data);
    return response.data;
  } catch (e) {
    logger.error('error occurred while fetching loans from account-service', e);
    return [];
  }
};

exports.reminders = async (loanids, reminderType, token, loanStatus, schemeSlabs) => {
  try {
    const options = {
      method: 'GET',
      url: `${urls.accounts.endpoint}${urls.accounts.loan}`,
      headers: {
        Authorization: `JWT ${token}`,
      },
      params: {
        ...(!isEmpty(loanStatus) && { loanStatus: loanStatus.join(',') }),
        lmsIds: loanids.join(','),
        reminders: true,
        reminderType,
        schemeSlabs,
      },
    };
    logger.info('calling account-service api to fetch loans with options:', options);
    const response = await axios(options);
    logger.info('fetched loans from account-service:', response.data);
    return response.data.data || [];
  } catch (e) {
    logger.error('error occurred while fetching loans from account-service', e);
    return [];
  }
};

exports.accountsCharges = async (lmsId, token) => {
  try {
    const response = await axios.get(`${urls.accounts.endpoint}${urls.accounts.charges}?lmsIds=${lmsId}`, {
      headers: {
        Authorization: `JWT ${token}`,
      },
    });
    logger.info('fetched charges from account-service:', response.data);
    return response.data;
  } catch (e) {
    logger.error('error occurred while fetching chrages from account-service', e);
    return [];
  }
};

exports.accountsLoans = async (query, token) => {
  try {
    const options = {
      method: 'GET',
      url: `${urls.accounts.endpoint}${urls.accounts.dashboardloan}`,
      headers: {
        authorization: `JWT ${token}`,
      },
      params: {
        ...query,
      },
    };
    logger.info('calling account service with options:', options);
    const response = await axios(options);
    logger.info('fetched dashboard loans from accounts service', response.data);
    return response.data;
  } catch (e) {
    logger.error('error occured while fetching dashboard loans from accounts service', e);
    return {};
  }
};
