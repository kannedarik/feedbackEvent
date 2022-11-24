const httpStatus = require('http-status');
const { map, pick } = require('lodash');
const axios = require('axios');
const APIError = require('../utils/APIError');
const { services } = require('../../config/vars');
const { logger } = require('../../config/logger');

exports.jwtvalidate = async (headers, pinAuthenticated = false) => {
  const options = {
    url: `${services.aaa.endpoint}${services.aaa.jwtvalidate}`,
    method: 'POST',
    headers: pick(headers, ['authorization']),
    params: { pinAuthenticated },
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
