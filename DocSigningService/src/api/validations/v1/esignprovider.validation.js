const { Joi, Segments } = require('celebrate');

module.exports = {
  // POST /api/v1/providers/esign
  create: {
    [Segments.BODY]: {
      name: Joi.string().alphanum().min(3).max(50)
        .required(),
      description: Joi.string().allow(''),
      key: Joi.string().allow(''),
      url: Joi.string().required(),
      password: Joi.string().required(),
    },
  },
  // GET /api/v1/providers/esign/:id
  read: {
    [Segments.PARAMS]: {
      id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },
  // PUT /api/v1/providers/esign/:id
  update: {
    [Segments.PARAMS]: {
      id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
    [Segments.BODY]: {
      name: Joi.string().alphanum().min(3).max(50),
      description: Joi.string().allow(''),
      key: Joi.string().allow(''),
      url: Joi.string(),
      password: Joi.string(),
    },
  },
  // DELETE /api/v1/providers/esign/:id
  remove: {
    [Segments.PARAMS]: {
      id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },
};
