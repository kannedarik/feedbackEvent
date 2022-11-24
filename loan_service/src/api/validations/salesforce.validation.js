const { Segments } = require('celebrate');
let { Joi } = require('celebrate');
Joi = Joi.extend(require('@joi/date'));

module.exports = {
  loans: {
    [Segments.PARAMS]: {
      searchId: Joi.string().required(),
    },

  },
  payments: {
    [Segments.QUERY]: {
      secureloanId: Joi.string().required(),
      unsecureloanId: Joi.string(),
    },
  },
};
