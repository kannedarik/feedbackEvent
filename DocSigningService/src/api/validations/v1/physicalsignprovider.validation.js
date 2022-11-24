const { Joi, Segments } = require('celebrate');

module.exports = {
  // POST /api/v1/providers/physical
  create: {
    [Segments.BODY]: {
      name: Joi.string().alphanum().min(3).max(50)
        .required(),
      description: Joi.string().allow(''),
    },
  },
  // GET /api/v1/providers/physical/:id
  read: {
    [Segments.PARAMS]: {
      id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },
  // PUT /api/v1/providers/physical/:id
  update: {
    [Segments.PARAMS]: {
      id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
    [Segments.BODY]: {
      name: Joi.string().alphanum().min(3).max(50),
      description: Joi.string().allow(''),
    },
  },
  // DELETE /api/v1/providers/physical/:id
  remove: {
    [Segments.PARAMS]: {
      id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },
};
