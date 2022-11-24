const { Joi, Segments } = require('celebrate');

module.exports = {
  // GET /api/v1/orders/payment/:requestId
  fetchOrderId: {
    [Segments.PARAMS]: {
      requestId: Joi.string().required(),
    },
  },

  // PUT /api/v1/orders/:id/status
  status: {
    [Segments.PARAMS]: {
      id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
    [Segments.BODY]: {
      status: Joi.string().required(),
    },
  },

  // get /api/v1/orders/orderdetails

  orderdetails: {
    [Segments.QUERY]: {
      orderIds: Joi.string().required(),
      loanCard: Joi.boolean(),
    },

  },

  activeOrders: {
    [Segments.QUERY]: {
      status: Joi.string().allow('created', 'cancelled', 'pending', 'processing', 'completed', 'cancellation_initiated', ''),
      lightweight: Joi.boolean(),
      loans: Joi.string(),
      customerId: Joi.string(),
    },
  },
};
