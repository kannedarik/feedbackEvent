const { Joi, Segments } = require('celebrate');

module.exports = {
  razorpay: {
    [Segments.BODY]: Joi.object().keys({
      event: Joi.string().required(),
    }).unknown(true),
  },
};
