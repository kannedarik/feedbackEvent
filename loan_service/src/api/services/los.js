const axios = require('axios');
const { urls } = require('../../config/vars');
const { logger } = require('../../config/logger');

/**
 * Get loans jewel lists for given lmsids
 */
exports.jewelList = async (token, filter) => {
  try {
    const options = {
      method: 'GET',
      url: `${urls.los.endpoint}${urls.los.jewellist}`,
      headers: {
        Authorization: `JWT ${token}`,
      },
      params: filter,
    };
    logger.info('calling los-service api to fetch loans jewel list with options:', options);
    const response = await axios(options);
    logger.info('fetched loans jewel list from los-service:', response.data);
    return response.data.data;
  } catch (e) {
    logger.error('error occurred loans jewel list from los-service', e);
    return [];
  }
};

/**
  Get orders from release service based on filters
 */
exports.orders = async (token, filter) => {
  try {
    const options = {
      method: 'GET',
      url: `${urls.los.endpoint}${urls.los.orders}`,
      headers: {
        Authorization: `JWT ${token}`,
      },
      params: filter,
    };
    logger.info('calling los-service api to fetch order list with options:', options);
    const response = await axios(options);
    logger.info('fetched order from los-service:', response.data);
    return response.data.orders;
  } catch (e) {
    logger.error('error occurred  while calling orders from los-service', e);
    return [];
  }
};
