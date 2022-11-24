const { Joi, Segments } = require('celebrate');

module.exports = {
  // POST /api/v1/feature-flag/
  create: {
    [Segments.BODY]: {
      identificationKeys: Joi.string().required(),
      featureName: Joi.string().required(),
      featureIdentifier: Joi.string().allow(''),
      values: Joi.string().allow(''),
    },
  },

  // GET /api/v1/feature-flag/
  read: {
    [Segments.QUERY]: {
      featureName: Joi.string().required(),
      featureIdentifier: Joi.string().allow(''),
      withValue: Joi.string().allow(''),
    },
  },

  // DELETE /api/v1/feature-flag/
  remove: {
    [Segments.BODY]: {
      identificationKeys: Joi.string().required(),
      featureName: Joi.string().required(),
      featureIdentifier: Joi.string().allow(''),
    },
  },
};
