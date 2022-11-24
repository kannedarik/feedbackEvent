const { Joi, Segments } = require('celebrate');

module.exports = {
  // POST /api/v1/requests/digital
  create: {
    [Segments.BODY]: {
      signer: {
        id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
        name: Joi.string().required(),
        phone: Joi.string().length(10).required(),
      },
      provider: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
      type: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
      order: Joi.string().required(),
      correlationid: Joi.string().required(),
      callbackurl: Joi.string(),
    },
  },

  // PUT /api/v1/requests/digital/:id/otp
  otp: {
    [Segments.PARAMS]: {
      id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
    [Segments.BODY]: {
      provider: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },

  // PUT /api/v1/requests/digital/:id/verify
  verify: {
    [Segments.PARAMS]: {
      id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
    [Segments.BODY]: {
      otp: Joi.string().required(),
    },
  },
};
