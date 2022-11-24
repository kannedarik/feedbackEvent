const { intersection } = require('lodash');
const httpStatus = require('http-status');
const RupeekService = require('../services/rupeek');
const APIError = require('../utils/APIError');

const re = /(\S+)\s+(\S+)/;

const parseAuthHeader = (hdrValue) => {
  const matches = hdrValue.match(re);
  return matches && { scheme: matches[1], value: matches[2] };
};

const getRoles = (headers) => {
  const headerObj = JSON.parse(headers);
  return headerObj.roles.map(item => item.name);
};

const getUser = async (headers) => {
  // request comes from Kong / API Gateway
  if (headers['x-consumer-id'] && headers['x-consumer-role']) {
    return {
      id: headers['x-consumer-id'],
      roles: getRoles(headers['x-consumer-role']),
      token: parseAuthHeader(headers.authorization).value || null,
    };
  }
  const user = await RupeekService.jwtvalidate(headers);
  return {
    ...user,
    token: parseAuthHeader(headers.authorization).value || null,
  };
};

exports.authorize = roles => async (req, res, next) => {
  try {
    const user = await getUser(req.headers);

    if (intersection(roles, user.roles).length === 0) {
      const apiError = new APIError({
        message: 'Forbidden',
        status: httpStatus.FORBIDDEN,
      });
      return next(apiError);
    }

    req.user = user;

    return next();
  } catch (e) {
    return next(e);
  }
};
