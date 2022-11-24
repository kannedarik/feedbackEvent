const { Segments } = require('celebrate');
const { Joi } = require('celebrate');

module.exports = {
  loandetails: {
    [Segments.QUERY]: {
      lmsId: Joi.string().required(),
    },
  },
};
