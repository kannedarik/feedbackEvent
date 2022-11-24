const { Joi, Segments } = require('celebrate');

module.exports = {
  // POST /api/v1/support/:orderId/signingstatus
  signingstatus: {
    [Segments.PARAMS]: {
      orderId: Joi.string().required(),
    },
  },
  // GET /api/v1/support/:orderId/signingstatus
  bankaccount: {
    [Segments.PARAMS]: {
      orderId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },
};
