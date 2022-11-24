const { Joi, Segments } = require('celebrate');

module.exports = {
  read: {
    [Segments.QUERY]: {
      lender: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
      branch: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },

  create: {
    [Segments.BODY]: {
      lender: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
      branch: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
      value: Joi.string().required(),
    },
  },

  update: {
    [Segments.BODY]: {
      lender: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
      branch: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
      value: Joi.string().required(),
    },
  },

  remove: {
    [Segments.BODY]: {
      lender: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
      branch: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },

  setConfig: {
    [Segments.BODY]: {
      lender: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
      branches: Joi.array().items(Joi.string().regex(/^[a-fA-F0-9]{24}$/).required()),
      value: Joi.string().required(),
    },
  },
};
