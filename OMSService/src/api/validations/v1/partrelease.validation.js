const { Joi, Segments } = require('celebrate');
const { regexValues } = require('../../utils/constants');

module.exports = {
  /* POST /api/v1/partrelease/case */
  create: {
    [Segments.BODY]: {
      loanId: Joi.number().required(),
      releaseAmountWithCashback: Joi.number(),
      isJewelExport: Joi.object().required(),
      totalWeight: Joi.number().required(),
      partReleaseWeight: Joi.number(),
      freshLoanAmount: Joi.number(),
      unsecureGLNumber: Joi.string(),
      secureReleaseAmount: Joi.number(),
      unsecureReleaseAmount: Joi.number(),
      payment: Joi.array().items({
        paidAmount: Joi.number().required(),
        cashback: Joi.number().required(),
        rpkId: Joi.string().required(),
        paidAt: Joi.string().required(),
      }),
    },
  },
  /* POST /api/v1/partrelease/slot */
  slot: {
    [Segments.BODY]: {
      isPISlot: Joi.boolean().required(),
      productCategory: Joi.string().required(),
      isRelatedLoan: Joi.boolean().required(),
      /* Confirm Slot */
      slotId: Joi.when('isPISlot', {
        is: false,
        then: Joi.string().regex(regexValues.hexadecimal).required(),
        otherwise: Joi.optional(),
      }),
      partreleaseTransactionId: Joi.string().regex(regexValues.hexadecimal).required(),
      agentsrequired: Joi.when('isPISlot', {
        is: true,
        then: Joi.number().optional(),
        otherwise: Joi.number().required(),
      }),
      /* Create loan application in LAS */
      leadId: Joi.string().required(),
      loanAmount: Joi.string().required(),
      reason: Joi.string().required(),
      cityId: Joi.number().required(),
      rupeekLender: Joi.string().regex(regexValues.hexadecimal).required(),
      rupeekLenderBranch: Joi.string().regex(regexValues.hexadecimal).required(),
      rupeekScheme: Joi.when('productCategory', {
        is: 'Gold Loan',
        then: Joi.string().required(),
        otherwise: Joi.optional(),
      }),
      isPartReleaseFresh: Joi.boolean().required(),
      /* close loan and mark it for part release */
      loans: Joi.array().min(1).max(1).required(),
      /* Create new loan request */
      phone: Joi.string().required(),
      address: Joi.string().required(),
      locality: Joi.string(),
      requestedAmount: Joi.when('productCategory', {
        is: 'Gold Loan',
        then: Joi.number().required(),
        otherwise: Joi.optional(),
      }),
      notes: Joi.when('productCategory', {
        is: 'Gold Loan',
        then: Joi.string(),
        otherwise: Joi.optional(),
      }),
      addressparts: Joi.object().keys({
        floor: Joi.string(),
        house: Joi.string(),
        apartment: Joi.string(),
        street: Joi.string(),
        area: Joi.string(),
        subarea: Joi.string(),
        landmark: Joi.string(),
        pincode: Joi.string(),
      }),
      timeslotstart: Joi.number().required(),
      timeslotend: Joi.number().required(),
      location: Joi.object().keys({
        x: Joi.string().required(),
        y: Joi.string().required(),
      }).required(),
      city: Joi.string().required(),
      /* Notify salesforce API */
      isRescheduling: Joi.when('productCategory', {
        is: 'Gold Loan',
        then: Joi.boolean().required(),
        otherwise: Joi.optional(),
      }),
      /* Reset transaction status API */
      freshLoanId: Joi.when('productCategory', {
        is: 'Gold Loan',
        then: Joi.when('isRescheduling', {
          is: true,
          then: Joi.string().regex(regexValues.hexadecimal).required(),
          otherwise: Joi.when('isRelatedLoan', {
            is: true,
            then: Joi.string().regex(regexValues.hexadecimal).required(),
            otherwise: Joi.optional(),
          }),
        }),
        otherwise: Joi.optional(),
      }),
      /* Notify worker  */
      caseRecordType: Joi.string().required(),
    },
  },
};
