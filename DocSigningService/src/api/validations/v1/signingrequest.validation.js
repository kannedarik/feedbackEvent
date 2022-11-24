const { Joi, Segments } = require('celebrate');

module.exports = {
  // GET /api/v1/requests
  list: {
    [Segments.QUERY]: {
      order: Joi.string(),
      correlationid: Joi.string(),
      type: Joi.string().regex(/^[a-fA-F0-9]{24}$/),
    },
  },
};
