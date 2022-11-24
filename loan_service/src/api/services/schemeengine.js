const axios = require('axios');
const { urls, schemeengine } = require('../../config/vars');
const { logger } = require('../../config/logger');


/**
 * Get scheme details from scheme engine
 */
exports.getSchemeDetails = async (params) => {
  try {
    const options = {
      method: 'GET',
      url: `${urls.schemeengine.endpoint}${urls.schemeengine.schemedetails}`,
      headers: {
        Authorization: schemeengine.basic_auth,
      },
      params,
    };
    logger.info('calling get scheme details api with options:', options);
    const response = await axios(options);
    logger.info('fetched scheme details from scheme engine', response.data);
    return response.data.data;
  } catch (e) {
    logger.error('error occurred while calling scheme details api', e);
    return [];
  }
};
