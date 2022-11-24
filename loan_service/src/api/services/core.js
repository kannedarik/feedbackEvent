const axios = require('axios');
const httpStatus = require('http-status');
const { urls } = require('../../config/vars');
const { logger } = require('../../config/logger');
const APIError = require('../utils/APIError');

/**
 * Get mapped loans data from core
 */
exports.maploans = async (userid, token) => {
  const options = {
    method: 'GET',
    url: `${urls.core.endpoint}${urls.core.maploans}`,
    headers: {
      Authorization: `JWT ${token}`,
    },
    params: {
      id: userid,
    },
  };
  const response = await axios(options);
  return response.data.mappedloans;
};

/**
 * Get mapped loans data from core
 */
exports.mapLoansVersion4 = async (userid, token) => {
  const options = {
    method: 'GET',
    url: `${urls.core.endpoint}${urls.core.maploansV4}`,
    headers: {
      Authorization: `JWT ${token}`,
    },
    params: {
      id: userid,
    },
  };
  const response = await axios(options);
  return response.data.mappedloans;
};

/**
 * Get mapped loans data from core
 */
exports.mapLoansVersion5 = async (userid, token, loannotvisible = null) => {
  try {
    const options = {
      method: 'GET',
      url: `${urls.core.endpoint}${urls.core.maploansV5}?loangateway=true`,
      headers: {
        Authorization: `JWT ${token}`,
      },
      params: {
        id: userid,
        loannotvisible,
      },
    };
    logger.info('calling maploansV5 with options', options);
    const response = await axios(options);
    logger.info('maploansV5 response', response.data.mappedloans);
    return response.data.mappedloans;
  } catch (e) {
    logger.error('error occurred while calling maploansversion5 api', e);
    throw new APIError({
      status: (e.response ? e.response.status : httpStatus.INTERNAL_SERVER_ERROR),
      message: (e.response ? (e.response.Error || e.response.Usermsg) : e.message),
    });
  }
};

exports.supportmaploans = async (userid, token) => {
  try {
    const options = {
      method: 'GET',
      url: `${urls.core.endpoint}${urls.core.supportmaploans}`,
      headers: {
        Authorization: `JWT ${token}`,
      },
      params: {
        id: userid,
      },
    };
    const response = await axios(options);
    return response.data.mappedloans;
  } catch (e) {
    throw new APIError({
      status: (e.response ? e.response.status : httpStatus.INTERNAL_SERVER_ERROR),
      message: (e.response ? (e.response.Error || e.response.Usermsg) : e.message),
    });
  }
};

exports.supportMapLoansVersion4 = async (userid, token) => {
  try {
    const options = {
      method: 'GET',
      url: `${urls.core.endpoint}${urls.core.supportmaploansV4}`,
      headers: {
        Authorization: `JWT ${token}`,
      },
      params: {
        id: userid,
      },
    };
    const response = await axios(options);
    return response.data.mappedloans;
  } catch (e) {
    throw new APIError({
      status: (e.response ? e.response.status : httpStatus.INTERNAL_SERVER_ERROR),
      message: (e.response ? (e.response.Error || e.response.Usermsg) : e.message),
    });
  }
};

exports.supportMapLoansVersion5 = async (userid, token, loangateway = null, allloans = null) => {
  try {
    const options = {
      method: 'GET',
      url: `${urls.core.endpoint}${urls.core.supportmaploansV5}`,
      headers: {
        Authorization: `JWT ${token}`,
      },
      params: {
        id: userid,
        loangateway,
        allloans,
      },
    };
    logger.info('calling supportmaploansV5 with options', options);
    const response = await axios(options);
    logger.info('supportmaploansV5 response', response.data.mappedloans);
    return response.data.mappedloans;
  } catch (e) {
    logger.error('error occurred while calling supportmaploansversion5 api', e);
    throw new APIError({
      status: (e.response ? e.response.status : httpStatus.INTERNAL_SERVER_ERROR),
      message: (e.response ? (e.response.Error || e.response.Usermsg) : e.message),
    });
  }
};

exports.operationalMetricsSupport = async (token, filter) => {
  const options = {
    method: 'GET',
    url: `${urls.core.endpoint}${urls.core.operationalMetricsSupport}`,
    headers: {
      Authorization: `JWT ${token}`,
    },
    params: filter,
  };
  logger.info('calling operationalMetrics Support with options', options);
  const response = await axios(options);
  logger.info('operationalMetricsSupport response', response.data);
  return response.data;
};

exports.operationalMetrics = async (token, filter) => {
  const options = {
    method: 'GET',
    url: `${urls.core.endpoint}${urls.core.operationalMetrics}`,
    headers: {
      Authorization: `JWT ${token}`,
    },
    params: filter,
  };
  logger.info('calling operationalMetrics with options', options);
  const response = await axios(options);
  logger.info('operationalMetrics response', response.data);
  return response.data;
};

exports.loanMapUser = async (lmsId) => {
  try {
    const options = {
      method: 'GET',
      url: `${urls.core.endpoint}${urls.core.loanmapuser}`,
      params: lmsId,
    };
    logger.info('calling loanmapuser with options', options);
    const response = await axios(options);
    logger.info('loanmapuser response', response.data);
    return response.data;
  } catch (e) {
    logger.error('error occured while fetching loanmapuser from core', e);
    return [];
  }
};
