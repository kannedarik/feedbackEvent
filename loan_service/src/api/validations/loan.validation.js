const { Segments } = require('celebrate');
let { Joi } = require('celebrate');
Joi = Joi.extend(require('@joi/date'));

module.exports = {
  supportlist: {
    [Segments.QUERY]: {
      userid: Joi.string().required(),
    },
  },
  supportcustomerlist: {
    [Segments.QUERY]: {
      phone: Joi.string().required(),
    },
  },
  supportaggregateloansjewels: {
    [Segments.QUERY]: {
      id: Joi.string().required(),
    },
  },
  toggleRelease: {
    [Segments.PARAMS]: {
      loanId: Joi.number(),
    },
    [Segments.QUERY]: {
      blockRelease: Joi.boolean().required(),
      releaseBlockDate: Joi.date().greater('now').format(['YYYY-MM-DD']).when('blockRelease', { is: false, then: Joi.required() }), // input date should be greater than today's date
    },
  },
  inProgress: {
    [Segments.QUERY]: {
      type: Joi.string(),
      orderIds: Joi.string(),
      coreIds: Joi.string(),
      partReleaseOrderIds: Joi.string(),
    },
  },
};
