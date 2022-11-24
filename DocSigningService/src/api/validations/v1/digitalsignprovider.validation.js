const { Joi, Segments } = require('celebrate');

module.exports = {
  // POST /api/v1/providers/digital
  create: {
    [Segments.BODY]: {
      name: Joi.string().min(3).max(50).required(),
      description: Joi.string().allow(''),
      key: Joi.string().allow(''),
      url: Joi.string(),
      password: Joi.string(),
      custom: Joi.object(),
    },
  },
  // GET /api/v1/providers/digital/:id
  read: {
    [Segments.PARAMS]: {
      id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },
  // PUT /api/v1/providers/digital/:id
  update: {
    [Segments.PARAMS]: {
      id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
    [Segments.BODY]: {
      name: Joi.string().min(3).max(50),
      description: Joi.string().allow(''),
      key: Joi.string().allow(''),
      url: Joi.string(),
      password: Joi.string(),
      custom: Joi.object(),
    },
  },
  // DELETE /api/v1/providers/digital/:id
  remove: {
    [Segments.PARAMS]: {
      id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },
};
