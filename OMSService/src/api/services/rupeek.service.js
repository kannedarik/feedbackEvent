const { pick, map } = require('lodash');
const axios = require('axios');
const httpStatus = require('http-status');
const APIError = require('../utils/APIError');
const { services } = require('../../config/vars');
const { logger } = require('../../config/logger');

exports.jwtvalidate = async (headers) => {
  const options = {
    method: 'POST',
    url: `${services.rupeek.endpoint}${services.rupeek.jwtvalidate}`,
    headers: pick(headers, ['authorization']), // to remove unnecessary headers
  };

  try {
    const response = await axios(options);
    return {
      ...response.data.user,
      roles: map(response.data.user.roles, (role) => role.name),
    };
  } catch (e) {
    logger.error('JWT validate failed', e);
    throw new APIError({
      status: (e.response ? e.response.status : httpStatus.INTERNAL_SERVER_ERROR),
      message: ((e.response && e.response.data) ? (e.response.data.ErrorMsg || e.response.data.UserMsg) : e.message), // eslint-disable-line max-len
    });
  }
};

exports.closeLoan = async (token, data) => {
  const options = {
    url: `${services.rupeek.endpoint}${services.rupeek.markLoanForPartrelease}`,
    method: 'POST',
    headers: {
      Authorization: `JWT ${token}`,
    },
    data,
  };

  const { data: response } = await axios(options);
  return response;
};

exports.fetchActiveTransaction = async (token, data) => {
  const options = {
    url: `${services.rupeek.endpoint}${services.rupeek.fetchActiveTransaction}`,
    method: 'POST',
    headers: {
      Authorization: `JWT ${token}`,
    },
    data,
  };

  const { data: response } = await axios(options);
  return response;
};

exports.createLoanRequest = async (token, data) => {
  const options = {
    url: `${services.rupeek.endpoint}${services.rupeek.createLoanRequest}`,
    method: 'POST',
    headers: {
      Authorization: `JWT ${token}`,
    },
    data,
  };

  const { data: response } = await axios(options);
  return response;
};

exports.resetTransactionStatus = async (token, data) => {
  const options = {
    url: `${services.rupeek.endpoint}${services.rupeek.resetTransactionStatus}`,
    method: 'POST',
    headers: {
      Authorization: `JWT ${token}`,
    },
    data,
  };

  const { data: response } = await axios(options);
  return response;
};
