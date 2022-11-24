const { Joi, Segments } = require('celebrate');

const VALID_CANCELLATION_REASONS = [
  'Need Release/ Part Release',
  'Customer changed their mind',
  'Others',
];

module.exports = {
  // POST /api/v1/orders/renewals
  create: {
    [Segments.BODY]: {
      loans: Joi.array().items(
        Joi.object().keys({
          loanid: Joi.string().required(),
          coreid: Joi.string().required(),
          eligibleweight: Joi.number().required(),
          keyword: Joi.string().required(),
        }).min(1).required(),
      ).required(),
      scheme: Joi.object().required(),
      loanEnhancementScheme: Joi.object().optional(),
    },
  },

  // DELETE /api/v1/orders/renewals/:processId
  cancel: {
    [Segments.PARAMS]: {
      processId: Joi.string().required(),
    },
  },

  // GET /api/v1/orders/renewals/active
  active: {
    [Segments.QUERY]: {
      customer: Joi.string().required(),
    },
  },

  // GET /api/v1/orders/renewals/:orderId
  read: {
    [Segments.PARAMS]: {
      orderId: Joi.string().required(),
    },
  },

  // GET /api/v1/orders/renewals/:orderId/signingmethods
  signingmethod: {
    [Segments.PARAMS]: {
      orderId: Joi.string().required(),
    },
    [Segments.QUERY]: {
      source: Joi.string(),
    },
  },

  // GET /api/v1/orders/renewals/:orderId/paymentmethods
  paymentmethod: {
    [Segments.PARAMS]: {
      orderId: Joi.string().required(),
    },
    [Segments.QUERY]: {
      includes: Joi.string(),
    },
  },

  // GET /api/v1/orders/renewals/:orderId/esign
  listESign: {
    [Segments.PARAMS]: {
      orderId: Joi.string().required(),
    },
  },

  // PUT /api/v1/orders/renewals/:orderId/signingmethods
  updateSigningMethod: {
    [Segments.BODY]: {
      id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
      name: Joi.string().alphanum().min(3).max(50),
      description: Joi.string().allow(''),
    },
  },

  // PUT /api/v1/orders/renewals/:orderId/signingmethods/sms
  signingsms: {
    [Segments.PARAMS]: {
      orderId: Joi.string().required(),
    },
    [Segments.BODY]: {
      type: Joi.string().required(),
      lock: Joi.boolean(),
    },
  },

  // PUT /api/v1/orders/renewals/:orderId/digisign/verify
  verifyDigiSign: {
    [Segments.PARAMS]: {
      orderId: Joi.string().required(),
    },
    [Segments.BODY]: {
      otp: Joi.string().required(),
    },
  },

  // PUT /api/v1/orders/renewals/:orderId/digisign/otp
  fetchDigiSignCode: {
    [Segments.PARAMS]: {
      orderId: Joi.string().required(),
    },
    [Segments.BODY]: {
      provider: Joi.string().required(),
    },
  },

  // GET /api/v1/orders/renewals/:orderId/document
  viewDocument: {
    [Segments.PARAMS]: {
      orderId: Joi.string().required(),
    },
  },

  // GET /api/v1/orders/renewals/:orderId/signeddocuments
  viewSignedDocument: {
    [Segments.PARAMS]: {
      orderId: Joi.string().required(),
    },
  },

  // PUT /api/v1/orders/renewals/:orderId/payment
  getPaymentLink: {
    [Segments.PARAMS]: {
      orderId: Joi.string().required(),
    },
    [Segments.BODY]: {
      retry: Joi.boolean(),
    },
  },

  // GET /api/v1/orders/renewals/:orderId/otp
  getOtpFromOrderId: {
    [Segments.PARAMS]: {
      orderId: Joi.string().required(),
    },
  },

  // PUT /api/v1/orders/renewals/:orderId/updateorder
  updateorder: {
    [Segments.PARAMS]: {
      orderId: Joi.string().required(),
    },
  },

  // POST api/v1/orders/renewals/kglrenewal
  createKGLOrder: {
    [Segments.BODY]: {
      loans: Joi.array().min(1).required(),
      paymentrequestid: Joi.string().required(),
      signingmethod: Joi.string().required(),
      signingstatus: Joi.string().required(),
    },
  },

  initiateCancellation: {
    [Segments.BODY]: {
      orderId: Joi.string().required(),
      cancellationReason: Joi.string().required().valid(...VALID_CANCELLATION_REASONS),
      cancellationComment: Joi.string().trim()
        .when('cancellationReason',
          {
            is: Joi.valid('Others'),
            then: Joi.required(),
            otherwise: Joi.optional(),
          }),
    },
  },
  // POST api/v1/orders/renewals/:orderId/validateaadhar
  validateAadhar: {
    [Segments.PARAMS]: {
      orderId: Joi.string().required(),
    },
    [Segments.BODY]: {
      aadharNumberSuffix: Joi.string().regex(/^[0-9]{4}$/).required(),
    },
  },
};
