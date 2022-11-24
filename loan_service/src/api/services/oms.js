const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { urls } = require('../../config/vars');
const { logger } = require('../../config/logger');

exports.getRenewalOrderDetails = async (token, params, correlationid = uuidv4()) => {
  const options = {
    method: 'GET',
    url: `${urls.oms.endpoint}${urls.oms.orderdetails}`,
    headers: {
      Authorization: `JWT ${token}`,
    },
    params,
  };

  logger.info(`${correlationid}: calling oms in progress orders api with options:`, options);
  const response = await axios(options);
  logger.info(`${correlationid}: oms in progress orders api response`, response.data);
  return response.data.orders;
};
