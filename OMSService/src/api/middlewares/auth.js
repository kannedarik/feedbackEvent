const { intersection } = require('lodash');
const httpStatus = require('http-status');
const passport = require('passport');
const Promise = require('bluebird');

const RupeekService = require('../services/rupeek.service');
const AaaService = require('../services/aaa.service');
const APIError = require('../utils/APIError');
const { logger } = require('../../config/logger');

const re = /(\S+)\s+(\S+)/;

const parseAuthHeader = (hdrValue) => {
  const matches = hdrValue.match(re);
  return matches && { scheme: matches[1], value: matches[2] };
};

const getRoles = (headers) => {
  const headerObj = JSON.parse(headers);
  return headerObj.roles.map((item) => item.name);
};

const getUser = async (headers, pinAuthenticated) => {
  // request comes from Kong / API Gateway
  if (!pinAuthenticated && headers['x-consumer-profile'] && headers['x-consumer-role']) {
    const profile = JSON.parse(headers['x-consumer-profile']);
    return {
      ...profile,
      roles: getRoles(headers['x-consumer-role']),
      token: parseAuthHeader(headers.authorization).value || null,
    };
  }
  const user = await AaaService.jwtvalidate(headers, pinAuthenticated);
  return {
    ...user,
    token: parseAuthHeader(headers.authorization).value || null,
  };
};

exports.authorize = (roles, pinAuthenticated) => async (req, res, next) => {
  try {
    const user = await getUser(req.headers, pinAuthenticated);

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
    logger.error('Failed to auth user', e);
    return next(e);
  }
};

const handleBasic = (req, res, next) => async (err, user, info) => {
  const error = err || info;
  req.logIn = Promise.promisify(req.logIn);
  const apiError = new APIError({
    message: error ? error.message : 'Unauthorized',
    status: httpStatus.UNAUTHORIZED,
    stack: error ? error.stack : undefined,
  });

  try {
    if (error || !user) throw error;
    await req.logIn(user, {
      session: false,
    });
    req.user = user;
    req.isAuthenticated = true;
    return next();
  } catch (e) {
    logger.error('Failed to auth user', e);
    return next(apiError);
  }
};

exports.authorizeKey = () => (req, res, next) => {
  passport.authenticate('basic', { session: false }, handleBasic(req, res, next))(req, res, next);
};
