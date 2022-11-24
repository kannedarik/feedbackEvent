const { Joi, Segments } = require('celebrate');
const Constants = require('../../utils/constants');

module.exports = {
  // POST /api/v1/customer/accounts/otp/{{transaction_id}}/resend
  resend: {
    [Segments.QUERY]: {
      type: Joi.string().valid(...Object.values(Constants.smsType)).default(Constants.smsType.CALL),
    },
  },
  initBankAccount: {
    [Segments.BODY]: {
      orderId: Joi.string().required(),
      bankAccount: Joi.object().keys({
        ifsc: Joi.string().length(11).required(),
        accountNumber: Joi.string().min(9).max(18).required(),
        beneficiaryName: Joi.string().required().min(4).regex(/^[a-zA-Z ]+$/),
      }),
    },
  },
};
