const { Joi, Segments } = require('celebrate');

module.exports = {
  // POST /api/v1/zeebe/deploy
  deploy: {
    [Segments.BODY]: {
      filename: Joi.string().required(),
    },
  },
};
