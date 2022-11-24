const { Joi, Segments } = require('celebrate');

module.exports = {
  lenderphones: {
    [Segments.QUERY]: {
      lender: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },
};
