const _ = require('lodash');
const Promise = require('bluebird');
const mongoose = require('mongoose');
const moment = require('moment');
const orderid = require('order-id');
const Order = require('./order.model');
const OrderDocSigning = require('./orderdocsigning.model');
const OrderItem = require('./orderitem.model');
const OrderPayment = require('./orderpayment.model');
const CoreService = require('../services/core.service');
const PaymentService = require('../services/payment.service');
const ZeebeService = require('../services/zeebe.service');
const MISService = require('../services/mis.service');
const APIError = require('../utils/APIError');
const { getTypes } = require('../utils/cache/docsign');
const featureFlagUtils = require('../utils/cache/featureFlag');
const {
  paymentMethod,
  paymentSigningMethodMap,
  paymentType,
  unsecuredLender,
  repledgeType,
  tenureExtensionEnabledLenders,
  lenderSlugParser,
  OTPLimit,
} = require('../utils/constants');
const RedisClient = require('../../config/redis');
const configVars = require('../../config/vars');
const { logger } = require('../../config/logger');
const constants = require('../utils/constants');
const helper = require('../utils/helper');
const ConfigWrapper = require('../../config/wrapper');

const actionStatus = ['pending', 'success', 'failure'];

/**
 *
 * @param {Object} securedLoan
 * @param {String} keyword
 */
function getRepledgeComponent(securedLoan, keyword) {
  if (keyword === repledgeType.LOAN_ENHANCEMENT) return securedLoan.loanEnhancement;
  /**
   * Note: Why can't we just check if keyword === 'ENHANCE' and return moreRepledge
   * otherwise return defaultRepledge?
   */
  return securedLoan.moreRepledge && securedLoan.moreRepledge.keyword === keyword
    ? securedLoan.moreRepledge
    : securedLoan.defaultRepledge;
}

// TODO: Move keyword to constants
const groupLoansByKeyword = ({ keyword }) => (keyword === repledgeType.LOAN_ENHANCEMENT
  ? 'loanEnhanceLoans'
  : 'renewalLoans');

function getNewLoans(user, data, version) {
  if (!data.loans) return { loans: [] };
  if (version === 2) {
    return CoreService.getNewLoansVersion4(user.token, data, version);
  } if (version >= 3) {
    return CoreService.getNewLoansVersion5(user.token, data, version);
  }
  return CoreService.getNewLoans(user.token, data, version);
}

async function getLoanEnhancedLoans(user, loans, loanEnhancementScheme) {
  if (!loans || loans.lenth === 0) {
    return { loans: [] };
  }

  if (!loanEnhancementScheme) {
    throw new APIError(
      {
        status: 400,
        message: 'No scheme selected for enhancement',
      },
    );
  }

  logger.info('Fetching loan enhancement options');
  const {
    options,
    renewaltype,
    ispartial,
    tenureextension,
    cityid,
  } = await CoreService.loanEnhancementOptions(user.token, { loans });
  const selectedLoanOption = options
    .find(({ scheme }) => scheme.id === loanEnhancementScheme.id);
  if (!selectedLoanOption) {
    throw new APIError(
      {
        status: 400,
        message: "Selected scheme doesn't match any of the options",
      },
    );
  }

  const everyLoanEligible = selectedLoanOption.loans
    .map((loan) => loan.find((component) => component.type === 'secure'))
    .every((secureComponent) => secureComponent.isEligibleForLoanEnhancement);
  if (!everyLoanEligible) {
    throw new APIError({
      status: 400,
      message: 'All loans selected should be eligible for enhancement',
    });
  }

  return {
    selectedLoanOption,
    renewaltype,
    ispartial,
    tenureextension,
    cityid,
  };
}

/**
 * Fetch renewal details for loans selected for renewal
 * and loan enhancement and merge loan enhancement loans
 * with loans of renewal details
 */
async function fetchRenewalDetails(user, data, version) {
  const { loanEnhanceLoans, renewalLoans } = _.groupBy(data.loans, groupLoansByKeyword);
  const renewalData = { scheme: data.scheme, loans: renewalLoans };

  const loanEnhanceLoansDetails = await getLoanEnhancedLoans(
    user,
    loanEnhanceLoans,
    data.loanEnhancementScheme,
  );
  const loanEnhancementLoans = _.get(loanEnhanceLoansDetails, ['selectedLoanOption', 'loans'], []);
  logger.info(`Fetched ${loanEnhancementLoans} loans for enhancement`);

  const renewalLoansDetails = await getNewLoans(user, renewalData, version);
  logger.info(`Fetched ${renewalLoansDetails.loans.length} loans details for renewal`);

  const details = {
    renewaltype: renewalLoansDetails.renewaltype || loanEnhanceLoansDetails.renewaltype,
    ispartial: renewalLoansDetails.ispartial || loanEnhanceLoansDetails.ispartial,
    ispartialLE: loanEnhanceLoansDetails.ispartial,
    tenureextension: renewalLoansDetails.tenureextension || loanEnhanceLoansDetails.tenureextension,
    loans: [...renewalLoansDetails.loans, ...loanEnhancementLoans],
    cityid: renewalLoansDetails.cityid || loanEnhanceLoansDetails.cityid,
  };

  return details;
}

/**
 * @param data
 * @param user
 * @param kglFlow
 * @param version version parameter for handling versioning
 * @returns {Promise<{renewaltype: *, ispartial: *, loans: *}>}
 */
const getLoans = async (data, user, kglFlow, version) => {
  if (!kglFlow) {
    logger.info('Fetching renewal details');
    const response = await fetchRenewalDetails(user, data, version);
    logger.info('Fetched renewal details');

    let isprocessingfee = false;
    const loans = _.map(response.loans, (loan) => {
      const securedLoan = _.find(loan, { type: 'secure' }); // assuming only one secured component

      const { keyword, eligibleweight } = _.find(data.loans, { loanid: securedLoan.lploanid });

      const repledgeComponent = getRepledgeComponent(securedLoan, keyword);
      logger.info('Fetched repledge component');

      const processFeeChargeType = _.find(constants.charges, { name: 'processingfee' }).type;
      const newSecureProcessingFeeChargeObject = _.find(
        repledgeComponent.newSecureCharges, { chargeType: processFeeChargeType },
      );
      const newUnSecureProcessingFeeChargeObject = _.find(
        repledgeComponent.newUnSecureCharges, { chargeType: processFeeChargeType },
      );
      const secureprocessingfeecharge = _.get(newSecureProcessingFeeChargeObject, 'grossAmount', 0);
      const unsecureprocessingfeecharge = _.get(newUnSecureProcessingFeeChargeObject, 'grossAmount', 0);
      const processingfeecharge = secureprocessingfeecharge + unsecureprocessingfeecharge;
      isprocessingfee = Boolean(processingfeecharge);

      return {
        lmsid: securedLoan.lploanid,
        losid: securedLoan.loanid,
        lender: securedLoan.lender,
        lenderid: securedLoan.lenderid,
        branchid: securedLoan.branchid,
        ...(securedLoan.oldunsecure && {
          unsecurelmsid: securedLoan.oldunsecure.lploanid,
          unsecurelosid: securedLoan.oldunsecure.loanid,
          unsecurelender: unsecuredLender,
          oldunsecureamount: securedLoan.oldunsecure.oldamount,
          unsecurepaidamount: repledgeComponent.unsecPaidComponent,
          unsecurecashback: repledgeComponent.unsecCashbackComponent,
          unsecureexcessfunding: repledgeComponent.unsecSoftRecoveryComponent,
          unsecureclosingamount: securedLoan.oldunsecure.closingamount,
          unsecurenextworkingdayinterest: securedLoan.unsecnwdi,
          unsecurenextworkingdaycashback: securedLoan.unsecnwdc,
        }),
        ...(repledgeComponent.currentDayRupeekPrinciple > 0 && {
          newunsecurelmsid: null,
          newunsecurelosid: null,
        }),
        totalDisbursalAmount: repledgeComponent.totalDisbursalAmount,
        totalEligibilityAmount: repledgeComponent.totalEligibilityAmount,
        newunsecureamount: repledgeComponent.currentDayRupeekPrinciple,
        newlmsid: null,
        newlosid: null,
        oldsecureamount: securedLoan.oldsecureamount,
        newsecureamount: repledgeComponent.currentDayLenderPrinciple,
        newsecuredisbursalamount: repledgeComponent.newSecureDisbursalAmount,
        oldsecuredisbursalamount: securedLoan.oldSecureDisbursalAmount,
        oldsecurecharges: securedLoan.oldSecureCharges,
        newsecurecharges: repledgeComponent.newSecureCharges,
        newunsecuredisbursalamount: repledgeComponent.newUnSecureDisbursalAmount,
        oldunsecuredisbursalamount: securedLoan.oldUnSecureDisbursalAmount,
        oldunsecurecharges: securedLoan.oldUnSecureCharges,
        newunsecurecharges: repledgeComponent.newUnSecureCharges,
        secureprocessingfeecharge,
        unsecureprocessingfeecharge,
        processingfeecharge,
        repledgetype: repledgeComponent.keyword,
        securepaidamount: repledgeComponent.repledgeamount,
        oldloandate: securedLoan.loanstartedon,
        newloandate: securedLoan.loandate,
        oldscheme: securedLoan.oldscheme,
        newscheme: securedLoan.scheme,
        securecashback: securedLoan.cashbackamountnwdc,
        secureexcessfunding: securedLoan.reconrecovery,
        secureclosingamount: securedLoan.closingamount,
        securebalanceamount: securedLoan.balanceamount,
        secureoutstandingprinciple: securedLoan.outstandingprinciple,
        repayments: securedLoan.repayments,
        oldloantype: getLoanType(response.renewaltype, !!securedLoan.oldunsecure),
        newloantype: (repledgeComponent.currentDayRupeekPrinciple > 0) ? '1:1' : '1:0',
        eligibleweight: Math.round((eligibleweight + Number.EPSILON) * 100) / 100,
        securenextworkingdayinterest: securedLoan.secnwdi,
        securenextworkingdaycashback: securedLoan.secnwdc,
        daysinnextworkingday: securedLoan.daysinnwd,
        securelenderrenewalcharges: repledgeComponent.lenderRenewalCharges,
        securebuffercharges: repledgeComponent.bufferCharges,
      };
    });
    return {
      loans,
      renewaltype: response.renewaltype,
      ispartial: response.ispartial,
      ispartialLE: response.ispartialLE,
      isprocessingfee,
      ...(response.cityid && {
        cityid: response.cityid,
      }),
    };
  }

  return {
    loans: data.loans,
    renewaltype: data.renewaltype,
    ispartial: data.ispartial,
  };
};

const getLoanType = (repledgetype, isUnSecuredPresent) => {
  if (repledgetype === 'N:1') {
    if (isUnSecuredPresent) {
      return 'N:1';
    }
    return 'N:0';
  }
  if (repledgetype === '1:1') {
    if (isUnSecuredPresent) {
      return '1:1';
    }
    return '1:0';
  }
  return repledgetype;
};

const orderAutomationState = ['manual', 'automated', 'automationCompleted', 'automationFailed'];

/**
 * RenewalOrder Schema
 * @private
 */
const renewalOrderSchema = new mongoose.Schema({
  signingmethod: {
    type: Object,
  },
  paymentmethod: {
    type: Object,
    default: paymentMethod,
  },
  signingstatus: {
    type: String,
    enum: actionStatus,
    default: 'pending',
  },
  paymentstatus: {
    type: String,
    enum: actionStatus,
    default: 'pending',
  },
  accountverificationstatus: {
    type: String,
    enum: actionStatus,
  },
  otpconsentstatus: {
    type: String,
    enum: actionStatus,
  },
  loanstatus: {
    type: String,
    enum: actionStatus,
    default: 'pending',
  },
  schemedata: {
    type: Object,
    required: true,
  },
  automationState: {
    type: String,
    enum: orderAutomationState,
    default: 'manual',
  },
  otplimit: {
    type: Number,
    default: OTPLimit,
  },
  aadharverification: {
    type: Object,
  },
  esignfailure: {
    type: Boolean,
  },
  appliedForRenewalAt: {
    type: Date,
  },
});

/**
 * Virtuals
 */
renewalOrderSchema.virtual('signingrequests', {
  ref: 'OrderDocSigning', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'orderId', // is equal to `foreignField`
  match: { status: { $ne: 'cancelled' } },
});

renewalOrderSchema.virtual('payment', {
  ref: 'OrderPayment', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'orderId', // is equal to `foreignField`
  match: { status: { $ne: 'cancelled' } },
  justOne: true,
});

renewalOrderSchema.virtual('poll').get(function pollFlag() {
  return !((this.paymentstatus === 'success' && this.loanstatus === 'success') || (this.paymentstatus === 'success' && this.signingstatus !== 'success'));
});

renewalOrderSchema.virtual('locksign').get(function signLockFlag() {
  return _.get(this, 'meta.islocked', true);
});

/**
 * Methods
 */
renewalOrderSchema.methods = {
  async branchIDs() {
    const orderItems = await OrderItem.find({ orderId: this._id });
    return _.chain(orderItems)
      .map((orderItem) => orderItem.meta.branchid)
      .uniq()
      .value();
  },

  async isAutomatedLenderPaymentSettled(userToken) {
    const orderPayments = await OrderPayment.find({ orderId: this._id, status: { $ne: 'cancelled' } });

    const isOrderPaymentSettled = async (orderPayment) => {
      try {
        const response = await PaymentService.getPaymentStatus(userToken, orderPayment.requestId);

        return response.status === 200
          && response.response.data.automated
          && response.response.data.isLenderPaymentSettled;
      } catch (err) {
        // We swallow the error and return false here so that we can fall back to the manual
        // automation flow.
        logger.error(`Error when checking payment settlement for request ID ${orderPayment.requestId}`, err);
        return false;
      }
    };

    return !_.isEmpty(orderPayments)
      && _.every(await Promise.map(orderPayments, isOrderPaymentSettled));
  },

  async isOldMISDataPresent() {
    const orderItems = await OrderItem.find({ orderId: this._id });
    const isNotEmpty = (v) => !_.isEmpty(v);

    return _.every(orderItems, (orderItem) => _.every([
      _.get(orderItem, 'meta.oldMISRecordDetails.lenderCustomerID'),
      _.get(orderItem, 'meta.oldMISRecordDetails.lenderCustomerName'),
      _.get(orderItem, 'meta.oldMISRecordDetails.lenderPrimaryPhone'),
    ], isNotEmpty));
  },

  /**
   * Returns a map of checks. Every value must be true for order automation
   * to be possible. Returning a map enables auditing why an order was not
   * automated.
   * @param {string} userToken - A user-specific JWT token. Needed to call an API on payments.
   * @returns {Object} An object representing a map of order automation checks.
   */
  async checkForOrderAutomation(userToken) {
    const enabledBranchIDs = await featureFlagUtils.getAllIdentificationKeys(
      constants.featureFlag.renewalAutomation,
    );
    const enabledBranchIDsV2 = await featureFlagUtils.getAllIdentificationKeys(
      constants.featureFlag.renewalAutomationv2,
    );
    await this.execPopulate('items'); // needed for hasLoanEnhancementLoans
    return {
      featureFlagEnabled: ConfigWrapper.lookupBoolean('ENABLE_RENEWAL_AUTOMATION'),
      doesNotHaveLoanEnhancedLoans: !this.hasLoanEnhancementLoans,
      isInEnabledBranchIDs: (helper.isSuperset(enabledBranchIDs, await this.branchIDs()))
        || (helper.isSuperset(enabledBranchIDsV2, await this.branchIDs())),
      isInEnabledSigningMethods: _.get(this, 'signingmethod.name', null) === constants.coreSigningMethodMap.esign,
      isSigningStatusSuccess: this.signingstatus === constants.coreSigningStatusMap.success,
      isAutomatedLenderPaymentSettled: await this.isAutomatedLenderPaymentSettled(userToken),
      isOldMISDataPresent: await this.isOldMISDataPresent(),
    };
  },
};

/**
 * Statics
 */
renewalOrderSchema.statics = {
  async createOrder(data, type, user, kglFlow = false, version = 0) {
    logger.info('Creating order', { loans: data.loans.map((l) => l.coreid) });
    const {
      loans, renewaltype, ispartial, ispartialLE, isprocessingfee, cityid,
    } = await getLoans(data, user, kglFlow, version);
    logger.info('Fetched loan renewal/enhancement details', loans.map((l) => ({ coreid: l.coreid, keyword: l.keyword })));

    // check cache for in-progress loans
    const loanIds = data.loans.map((l) => l.loanid);
    await Promise.map(loanIds, async (loanId) => {
      const cachedData = await RedisClient.getAsync(loanId);
      if (cachedData) {
        throw new APIError(
          {
            status: 400,
            message: 'Payment is already in-progress for one or more loans selected',
          },
        );
      }
    });

    // check for in-progress payments
    const { lmsIdToSuccessRpkIdMap, lmsIdToAuthorizedRpkIdMap } = await this.fetchLmsIdToRpkIdMap(loanIds);
    logger.info(`lmsIdToSuccessRpkIdMap : ${JSON.stringify(lmsIdToSuccessRpkIdMap)}`);
    logger.info(`lmsIdToAuthorizedRpkIdMap : ${JSON.stringify(lmsIdToAuthorizedRpkIdMap)}`);

    const successRPKIds = _.compact(_.values(lmsIdToSuccessRpkIdMap));
    const inProgressRPKIds = _.compact(_.values(lmsIdToAuthorizedRpkIdMap));
    if (!_.isEmpty(successRPKIds)) {
      const lmsIds = _.keys(lmsIdToSuccessRpkIdMap);
      logger.info(`success losIds : ${lmsIds}`);
      _.forEach(lmsIds, (lmsId) => {
        RedisClient.setAsync(lmsId, lmsIdToSuccessRpkIdMap[lmsId], 'EX', configVars.redis.expiry.payment);
      });
      throw new APIError(
        {
          status: 400,
          message: 'Payment is already in-progress for one or more loans selected',
        },
      );
    } else if (!_.isEmpty(inProgressRPKIds)) {
      const params = {
        rpkids: _.join(inProgressRPKIds)
      }
      const { response: razorpayPaymentStatus } = await PaymentService.checkRazorpayPaymentStatus(configVars.supportJwtToken, params);
      logger.info(`razorpayPaymentStatus : ${JSON.stringify(razorpayPaymentStatus)}`);
      if (_.includes(_.values(razorpayPaymentStatus), 'authorized')) {
        const authorizedRpkIds = _.chain(razorpayPaymentStatus)
          .pickBy((value) => value==="authorized")
          .keys()
          .value();
        logger.info(`authorizedRpkIds : ${authorizedRpkIds}`);
        const lmsIds = _.chain(lmsIdToAuthorizedRpkIdMap)
          .pickBy((value) => _.includes(authorizedRpkIds, value))
          .keys()
          .value();
        logger.info(`authorized lmsIds : ${lmsIds}`);
        _.forEach(lmsIds, (lmsId) => {
          RedisClient.setAsync(lmsId, lmsIdToAuthorizedRpkIdMap[lmsId], 'EX', configVars.redis.expiry.payment);
        });
        throw new APIError(
          {
            status: 400,
            message: 'Payment is already in-progress for one or more loans selected',
          },
        );
      }
    }
    
    // eslint-disable-next-line no-nested-ternary
    const ispartialflag = kglFlow ? ispartial : (renewaltype === 'N:1' ? ispartial : false);
    const ispartialLEflag = renewaltype === 'N:1' ? ispartialLE : false;
    let processingfeecharge = 0;
    if (version >= 3) {
      processingfeecharge = _.sumBy(loans, 'processingfeecharge');
    }

    const order = await this.create({
      orderId: orderid(configVars.secretkey).generate(),
      customerId: user.id,
      type: type._id,
      amount: _.sumBy(loans, 'securepaidamount'),
      schemedata: data.scheme, // TODO: Does this need validation?
      otplimit: OTPLimit,
      meta: {
        renewaltype,
        ispartial: ispartialflag,
        ispartialLE: ispartialLEflag,
        isprocessingfee,
        ...(isprocessingfee && { processingfeecharge }),
        ...(kglFlow && {
          iskgl: true,
        }),
        islocked: false,
        lockbankverification: false,
        tenureextension: _.includes(tenureExtensionEnabledLenders, loans[0].lender),
        lender: loans[0].lender,
        version,
        ...(cityid && cityid > 0 && {
          cityid,
        }),
      },
      timestamps: {
        created: moment().toISOString(),
        ...(kglFlow && {
          pending: moment().toISOString(),
        }),
      },
      ...(kglFlow && {
        status: 'pending',
        paymentstatus: 'success',
        signingstatus: data.signingstatus,
        signingmethod: (await getTypes({ name: data.signingmethod }, 'array'))[0],
      }),
    });

    // TODO: add scheme if LE
    const items = _.map(loans, (loan) => ({
      orderId: order._id,
      meta: loan,
    }));

    if (ConfigWrapper.lookupBoolean('ENABLE_RENEWAL_AUTOMATION')) {
      await Promise.each(items, async (item) => {
        try {
          // Although we could technically make this API call in the MIS consumer
          // where the customer ID is needed, we persist the data here since we
          // need to query order items by lenderCustomerID.
          const misRecordDetails = await MISService.getMISCustomerDetails(item.meta.lmsid);

          // eslint-disable-next-line no-param-reassign
          item.meta.oldMISRecordDetails = {
            // Adding a toString here because the customerid is a string in QA, but
            // a number in production.
            lenderCustomerID: misRecordDetails.customerid.toString(),
            lenderCustomerName: misRecordDetails.customername,
            lenderPrimaryPhone: misRecordDetails.primaryphone,
          };
        } catch (error) {
          // In QA, renewals will fail because this API call will fail unless
          // the MIS data is present in the MIS-ETL service.
          // We swallow it for now to avoid blocking people, but in production
          // this should not be the case.
          // TODO: Update the data builder scripts to create records in MIS-ETL.
          logger.error('Error while fetching customer details from MIS', error);
        }
      });
    }

    const [lenderSlug] = _.uniq(_.map(loans, (loan) => loan.lender));
    await OrderItem.create(items);

    // eslint-disable-next-line max-len
    const hasLELoan = !!_.find(items, (item) => item.meta.repledgetype === repledgeType.LOAN_ENHANCEMENT);

    const workflowInstanceName = kglFlow ? 'kgl-renewal' : 'renewal-process';
    const result = await ZeebeService.createWorkflowInstance(workflowInstanceName, {
      orderid: order._id.toString(),
      customerorder: order.orderId,
      amount: order.amount,
      ordertype: type.name,
      renewaltype: order.meta.renewaltype,
      token: user.token,
      signingmethod: kglFlow ? order.signingmethod.name : null,
      paymentmethod: order.paymentmethod.name,
      signingstatus: order.signingstatus,
      paymentstatus: order.paymentstatus,
      loanstatus: order.loanstatus,
      status: order.status,
      ...(order.meta.processingfeecharge && {
        processingfeecharge: order.meta.processingfeecharge,
      }),
      customer: {
        id: order.customerId,
        name: user.firstname,
        city: {
          id: (user.cityid || 1),
          name: user.city,
        },
      },
      phone: user.phone,
      securedlender: lenderSlug,
      unsecuredlender: unsecuredLender,
      signingsms: false,
      ticketcreated: false,
      loanEnhancementTicketCreated: false,
      locksign: order.meta.islocked,
      lockbankverification: order.meta.lockbankverification,
      ...(kglFlow && {
        version: 1,
      }),
      ispartial: order.meta.ispartial,
      ispartialLE: order.meta.ispartialLE,
      tenureextension: order.meta.tenureextension,
      version: order.meta.version,
      hasLELoan,
      accountNumberHasChanged: false,
      accountVerified: false,
      otpVerified: false,
      ...(cityid && cityid > 0 && {
        cityid,
      }),
    });

    order.processId = result.workflowInstanceKey;
    await order.save();

    if (kglFlow) {
      const paymentStatusResponse = await PaymentService.getPaymentStatus(user.token, data.paymentrequestid); // eslint-disable-line max-len
      if (paymentStatusResponse.status === 200) {
        await OrderPayment.create({
          orderId: order._id,
          status: 'success',
          requestId: data.paymentrequestid,
          meta: {
            pgresponse: {
              payment: {
                entity: {
                  notes: { order_id: data.paymentrequestid },
                },
              },
            },
            loandata: paymentStatusResponse.response.data.loandata,
          },
        });
      }
    }

    return order;
  },

  async listSigningMethods(order, user, queryparams = {}) {
    const [signingtypes] = await Promise.all([
      getTypes(null, 'array'),
    ]);

    // Removing Physical method if source is equal to statuscard
    //  if (queryparams.source && queryparams.source === 'statuscard') {
    // _.remove(signingtypes, { name: 'physical' });
    // }
    const secureClosingAmount = _.sumBy(order.items, (item) => item.meta.secureclosingamount);
    
    const isenabledBranchID = await featureFlagUtils.getSingleIdentificationKey(
      constants.featureFlag.fed2fa, null, order.items[0].meta.branchid,
    );

    // Disabling the offline option for all lenders, while selecting the signing options.
    _.remove(signingtypes, { name: 'physical' });

    // Disabling Esign when tenure extension is true
    if (order.meta && order.meta.lender !== 'kvb' && order.meta.lender !== 'icici' && order.meta.tenureextension) {
      _.remove(signingtypes, { name: 'esign' });
    }

    // Removing 2fa when esign failed or secure closure amount is greater than limit or branch is not enabled for fedotp
    if (order.meta && order.meta.lender === 'federal' && (!order.esignfailure || secureClosingAmount > constants.fed2fa.fedSecureClosingAmountLimit || !isenabledBranchID)) {
      _.remove(signingtypes, { name: '2fa' });
    }

    // Removing Digital method when tenure-extension is false
    if (order.meta && order.meta.lender !== 'kvb' && !order.meta.tenureextension) {
      _.remove(signingtypes, { name: 'digital' });

      return signingtypes;
    }

    // Removing Esign and 2fa for KVB
    if (order.meta && order.meta.lender === 'kvb') {
      _.remove(signingtypes, { name: 'esign' });
      _.remove(signingtypes, { name: '2fa' });
      return signingtypes;
    }

    // Removing Digital and 2fa for icici
    if (order.meta && order.meta.lender === 'icici') {
      _.remove(signingtypes, { name: 'digital' });
      _.remove(signingtypes, { name: '2fa' });
    }

    _.remove(signingtypes, { name: 'digital' });

    return signingtypes;
  },

  async listPaymentMethods(order, user) {
    const data = {
      loans: _.map(order.items, (item) => ({
        loanid: item.meta.lmsid,
        amount: item.meta.securepaidamount,
      })),
      type: paymentType[order.type.name],
      lender: _.uniq(_.map(order.items, (item) => item.meta.lender)),
    };
    const response = await PaymentService.getPaymentOptions(user.token, data);
    return response;
  },

  async updateSigningMethod(order, smsflag = false, options = {}) {
    await OrderDocSigning.updateMany({
      orderId: order._id,
    }, {
      status: 'cancelled',
    });

    const variableUpdates = _.merge({
      signingmethod: order.signingmethod.name,
      signingstatus: order.signingstatus,
      status: order.status,
      signingsms: smsflag,
      locksign: order.meta.islocked,
      ...(order.meta.lenderphone && { phone: order.meta.lenderphone }),
      signingrequests: [],
      ...(order.meta.iskgl && {
        version: 2,
      }),
    }, options);

    await ZeebeService.publishMessage(order._id.toString(), 'signing_selection_event', variableUpdates);
    return true;
  },

  async generatePayLink(order, user, body) {
    const data = {
      repledgeversion: 'V2',
      lender: _.uniq(_.map(order.items, (item) => item.meta.lender)),
      paymentamount: order.amount,
      paymentdata: {
        loans: _.map(order.items, (item) => ({
          lender: item.meta.lender,
          loanid: item.meta.lmsid,
          type: order.meta.renewaltype,
          paidamount: item.meta.securepaidamount,
          repledgetype: item.meta.repledgetype,
          eligibleweight: item.meta.eligibleweight,
        })),
        type: paymentType[order.type.name],
        verificationtype: paymentSigningMethodMap[order.signingmethod.name],
        all_in_group: !order.meta.ispartial,
        schemeobject: order.schemedata,
      },
      ...(order.meta.cityid, {
        cityid: order.meta.cityid,
      }),
    };
    const response = await PaymentService.getPaymentLink(user.token, data);

    // remove old entries
    await OrderPayment.updateMany({
      orderId: order._id,
      status: { $ne: 'success' },
    }, {
      status: 'cancelled',
    });
    await OrderPayment.create({
      orderId: order._id,
      requestId: response.link,
      ...(body && body.retry && { retry: body.retry }),
      ...(response.payment === false && response.loandata && {
        status: 'success',
        meta: {
          loandata: response.loandata,
        },
      }),
    });

    if (response.payment === false && response.loandata) {
      order.paymentstatus = 'success'; // eslint-disable-line no-param-reassign
      await order.save();

      await ZeebeService.publishMessage(order._id.toString(), 'payment_response_event', {
        paymentstatus: order.paymentstatus,
        transactionid: response.link,
        loandata: response.loandata,
      });
    }

    return response;
  },

  async sendSigningSMS(order, type, lock = false) {
    await this.updateSigningMethod(order, true, {
      signingmethod: type,
      signingstatus: 'pending',
      locksign: lock,
    });
    return true;
  },

  async cancelOrder(processId) {
    const order = await this.findOne({
      processId,
    });

    if (order) {
      order.status = 'cancelled';

      await Promise.all([
        order.save(),
        OrderDocSigning.updateMany({
          orderId: order._id,
        }, {
          status: 'cancelled',
        }),
        OrderPayment.updateMany({
          orderId: order._id,
        }, {
          status: 'cancelled',
        }),
      ]);
    }

    return true;
  },

  async lockBankVerification(order) {
    await ZeebeService.publishMessage(order._id.toString(), 'lock_bank_verification_event', {
      lockbankverification: true,
    });
    return true;
  },

  async fetchLmsIdToRpkIdMap(loans) {
    const orderItems = await OrderItem.find({ "meta.lmsid": { $in: loans } });
    let lmsIdToSuccessRpkIdMap = {};
    let lmsIdToAuthorizedRpkIdMap = {};
    if (_.isEmpty(orderItems)) {
      return { lmsIdToSuccessRpkIdMap, lmsIdToAuthorizedRpkIdMap };
    }
    const orderIds = _.chain(orderItems)
      .map((orderItem) => orderItem.orderId)
      .uniq()
      .value();
    logger.info(`Inprogress orderIds => ${orderIds} for loanIds ${loans}`);
    const inProgressOrders = await this.find({
      _id: { $in: orderIds },
      status: {
        $in: [
          'pending',
          'processing',
          'cancellation_initiated',
        ],
      }
    })
      .sort({ createdAt: -1 })
      .populate({
        path: 'payment',
        match: {
          $or: [
            {
              status: 'created',
              createdAt: { $gt: moment().utc().subtract(configVars.authorizedPaymentExpiryInMinutes, 'minutes').toISOString() },
            },
            {
              status: 'success',
            }
          ]
        },
      });

    _.map(inProgressOrders, (order) => {
      const orderItemList = _.filter(orderItems, { orderId: order._id });
      _.map(orderItemList, orderItemObj => {
        if (!_.isEmpty(order.payment)) {
          if (order.payment.status === 'success' && _.isEmpty(lmsIdToSuccessRpkIdMap[orderItemObj.meta.lmsid])) {
            lmsIdToSuccessRpkIdMap[orderItemObj.meta.lmsid] = order.payment.requestId;
          } else if (_.isEmpty(lmsIdToAuthorizedRpkIdMap[orderItemObj.meta.lmsid])) {
            lmsIdToAuthorizedRpkIdMap[orderItemObj.meta.lmsid] = order.payment.requestId;
          }
        }
      });
    });
    return { lmsIdToSuccessRpkIdMap, lmsIdToAuthorizedRpkIdMap };
  }
};

renewalOrderSchema.set('toJSON', {
  virtuals: true,
  transform: (doc) => _.pick(doc, [
    'orderId', 'customerId', 'type', 'status', 'amount', 'signingmethod', 'paymentmethod',
    'signingstatus', 'paymentstatus', 'loanstatus', 'payment', 'poll', 'locksign', 'hasLoanEnhancementLoans', 'processId',
  ]),
});

/**
 * @typedef RenewalOrder
 */
module.exports = Order.discriminator('RenewalOrder', renewalOrderSchema);
