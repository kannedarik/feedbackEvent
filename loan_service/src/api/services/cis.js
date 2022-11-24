const axios = require('axios');
const httpStatus = require('http-status');
const { urls } = require('../../config/vars');
const { logger } = require('../../config/logger');
const APIError = require('../utils/APIError');

exports.customerDetails = async (custId) => {
  try {
    const options = {
      method: 'GET',
      url: `${urls.cis.endpoint}${urls.cis.basicdetails}/${custId}`,
      headers: {
        'X-Client-Id': `${urls.cis.clientid}`,
      },
    };
    logger.info('calling cis service with options:', options);
    const response = await axios(options);
    logger.info('fetched customer basic details from cis service', response.data);
    return response.data;
  } catch (err) {
    logger.error('Error occured while calling cis service', err);
    return {};
  }
};

exports.customerDetailsByPhone = async (phone) => {
  try {
    const options = {
      method: 'GET',
      url: `${urls.cis.endpoint}${urls.cis.basicdetails}/phone/${phone}`,
      headers: {
        'X-Client-Id': `${urls.cis.clientid}`,
      },
    };
    logger.info('calling cis service with options:', options);
    const response = await axios(options);
    logger.info('fetched customer basic details from cis service', response.data);
    return response.data;
  } catch (e) {
    logger.error('Error occured while calling cis service', e);
    throw new APIError({
      status: (e.response ? e.response.status : httpStatus.INTERNAL_SERVER_ERROR),
      // eslint-disable-next-line max-len
      message: (e.response ? (e.response.data.UserMsg || e.response.error) : httpStatus.INTERNAL_SERVER_ERROR),
    });
  }
};
