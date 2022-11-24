const { Joi, Segments } = require('celebrate');

module.exports = {
  // POST /api/v1/requests/esign
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
      baseurl: Joi.string().required(),
      redirecturl: Joi.string().required(),
      callbackurl: Joi.string(),
      purpose: Joi.string().required(),
      document: Joi.string().required(),
      custom: Joi.object(),
    },
  },
};
