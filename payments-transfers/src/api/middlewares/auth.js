const _ = require('lodash');
const httpStatus = require('http-status');
const logger = require('../../config/logger').logger;

const APIError = require('../utils/APIError');
const env = require('../../config/vars').env;
const rolesConst = require('../utils/constants/constants').ROLES;

exports.kong = () => (req, res, next) => {
  // check for kong
  if (env === "development") {
    return next();
  }
  if (!req.user) req.user = {};
  logger.info('Kong header', req.headers);
  if (req.headers['x-consumer-id'] && req.headers['x-consumer-role']) {
    req.user.consumerid = req.headers['x-consumer-id'];
    req.user.id = req.headers['x-consumer-id'];
    req.user.consumerrole = req.headers['x-consumer-role'];
    return next();
  }
  return next(new APIError({
    status: httpStatus.UNAUTHORIZED,
    message: 'You are not allowed to access this resource. Reason: KONG failure.',
  }));
};

exports.admin = () => (req, res, next) => {
  if (env === "development") {
    return next();
  }
  try {
    const roles = JSON.parse(req.user.consumerrole);
    if (_.find(roles.roles, { name: rolesConst.ADMIN })) {
      return next();
    }
    return next(new APIError({
      status: httpStatus.UNAUTHORIZED,
      message: 'You are not allowed to access this resource. Reason: KONG failure.',
    }));
  } catch (err) {
    return next(new APIError({
      status: httpStatus.UNAUTHORIZED,
      message: 'You are not allowed to access this resource. Reason: KONG failure.',
    }));
  }
};

exports.support = () => (req, res, next) => {
  if (env === "development") {
    return next();
  }
  try {
    const roles = JSON.parse(req.user.consumerrole);
    if (_.find(roles.roles, { name: rolesConst.SUPPORT })) {
      return next();
    }
    return next(new APIError({
      status: httpStatus.UNAUTHORIZED,
      message: 'You are not allowed to access this resource. Reason: KONG failure.',
    }));
  } catch (err) {
    return next(new APIError({
      status: httpStatus.UNAUTHORIZED,
      message: 'You are not allowed to access this resource. Reason: KONG failure.',
    }));
  }
};

exports.customer = () => (req, res, next) => {
  if (env === 'development') {
    return next();
  }
  try {
    const roles = JSON.parse(req.user.consumerrole);
    if (_.find(roles.roles, { name: rolesConst.CUSTOMER })) {
      return next();
    }
    return next(new APIError({
      status: httpStatus.UNAUTHORIZED,
      message: 'You are not allowed to access this resource. Reason: KONG failure.',
    }));
  } catch (err) {
    return next(new APIError({
      status: httpStatus.UNAUTHORIZED,
      message: 'You are not allowed to access this resource. Reason: KONG failure.',
    }));
  }
};

exports.paymentservice = () => (req, res, next) => {
  if (env === 'development') {
    return next();
  }
  try {
    const roles = JSON.parse(req.user.consumerrole);
    if (_.find(roles.roles, { name: rolesConst.PAYMENTSERVICE })) {
      return next();
    }
    return next(new APIError({
      status: httpStatus.UNAUTHORIZED,
      message: 'You are not allowed to access this resource. Reason: KONG failure.',
    }));
  } catch (err) {
    return next(new APIError({
      status: httpStatus.UNAUTHORIZED,
      message: 'You are not allowed to access this resource. Reason: KONG failure.',
    }));
  }
};

exports.superuser = () => (req, res, next) => {
  if (env === 'development') {
    return next();
  }
  try {
    const roles = JSON.parse(req.user.consumerrole);
    if (_.find(roles.roles, { name: rolesConst.SUPERUSER })) {
      return next();
    }
    return next(new APIError({
      status: httpStatus.UNAUTHORIZED,
      message: 'You are not allowed to access this resource. Reason: KONG failure.',
    }));
  } catch (err) {
    return next(new APIError({
      status: httpStatus.UNAUTHORIZED,
      message: 'You are not allowed to access this resource. Reason: KONG failure.',
    }));
  }
};
