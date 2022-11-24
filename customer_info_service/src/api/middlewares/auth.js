const { intersection } = require('lodash');
const httpStatus = require('http-status');
const IdentityService = require('../services/identity.service');
const APIError = require('../utils/APIError');


exports.authorize = roles => async (req, res, next) => {
  try {
    const user = await IdentityService.jwtvalidate(req.headers);

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
