module.exports = {
  ROLES: {
    CUSTOMER: 'customer',
    SUPPORT: 'support',
    ADMIN: 'admin',
    PAYMENTSERVICE: 'paymentservice',
    SUPERUSER: 'superuser',
  },

  PAYMENT_REQUEST_STATUS: {
    CREATED: 'CREATED',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED'
  },
  //events to be captured by the app
  PAYMENT_REQUEST_EVENTS: {
    CAPTURED: 'payment.captured',
    VAN_PAYMENT: 'virtual_account.credited'
  },

  PAYMENT_STATUS: {
    CAPTURED: 'CAPTURED'
  },

  RAZORPAY: {
    CURRENCY: {
      INR: 'INR'
    },
    PAYMENT_STATUS: {
      CAPTURED: 'captured',
    }
  },

  PAYMENT_TYPE: {
    DEFAULT: 'DEFAULT',
    TEMPVAN: 'TEMPVAN',
    UNLINKEDVAN: 'UNLINKEDVAN'
  },

  ACCOUNTS_SERVICE: {
    //source of the payment captured in accounts service
    SOURCE: {
      CUST: 'CUST'
    }
  },

  LENDERS: {
    TAKEOVER: 'takeover',
    RUPEEK: 'rupeek',
    RENEWAL: 'renewal'
  },

  MESSAGE_KEYS: {
    RENEWAL: 'renewal'
  },

  LOAN_TYPES: {
    DEFAULT: 'DEFAULT',
    TAKEOVER: 'TAKEOVER',
    RENEWAL: 'RENEWAL'
  }

};
