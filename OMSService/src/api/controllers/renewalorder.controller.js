const {
  chain, find, includes, isEmpty, map, omit, pick, sumBy, uniq, compact, get, isEqual,
} = require('lodash');
const httpStatus = require('http-status');
const moment = require('moment');
const OrderBankAccount = require('../models/orderbankaccount.model');
const OrderType = require('../models/ordertype.model');
const RenewalOrder = require('../models/renewalorder.model');
const CoreService = require('../services/core.service');
const DocSignService = require('../services/docsign.service');
const KycService = require('../services/kyc.service');
const { getDigitSignProviders, getTypes } = require('../utils/cache/docsign');
const {
  notificationProviderMap, coreSigningMethodMap, unsecuredLender, aadharVerification,
} = require('../utils/constants');
const ZeebeService = require('../services/zeebe.service');

const isAadharVerificationValid = (aadharverification) => aadharverification && moment().diff(moment(aadharverification.lastAttemptedAt), 'minutes') < aadharVerification.expirytime;
const renewalOrderData = (order) => {
  const securedLoans = map(order.items, (item) => ({
    loantype: 'secure',
    lmsid: item.meta.lmsid,
    losid: item.meta.losid,
    lender: item.meta.lender,
    loanamount: item.meta.oldsecureamount,
    scheme: item.meta.oldscheme,
    closingamount: item.meta.secureclosingamount,
    type: item.meta.oldloantype,
    repledgetype: item.meta.repledgetype,
    groupid: item.meta.unsecurelosid,
    ...(item.meta.oldsecuredisbursalamount && item.meta.oldsecurecharges && {
      olddisbursalamount: item.meta.oldsecuredisbursalamount,
      oldsecurecharges: item.meta.oldsecurecharges,
    }),
  }));
  let unsecuredLoans = [];
  if (order.meta.renewaltype === '1:1') {
    unsecuredLoans = chain(order.items)
      .filter((item) => item.meta.oldloantype === '1:1')
      .map((item) => ({
        loantype: 'unsecure',
        lmsid: item.meta.unsecurelmsid,
        losid: item.meta.unsecurelosid,
        lender: (item.meta.unsecurelender || unsecuredLender),
        loanamount: item.meta.oldunsecureamount,
        scheme: item.meta.oldscheme,
        closingamount: item.meta.unsecureclosingamount,
        groupid: item.meta.unsecurelosid,
        repledgetype: item.meta.repledgetype,
        ...(item.meta.oldunsecuredisbursalamount && item.meta.oldunsecurecharges && {
          olddisbursalamount: item.meta.oldunsecuredisbursalamount,
          oldunsecurecharges: item.meta.oldunsecurecharges,
        }),
      }))
      .value();
  }
  if (order.meta.renewaltype === 'N:1') {
    const [unsecuredLoan] = order.items;
    if (unsecuredLoan.meta.oldloantype === 'N:1') {
      const unsecurebifurcation = chain(order.items)
        .map((item) => ({
          oldunsecureamount: item.meta.oldunsecureamount,
          unsecureclosingamount: item.meta.unsecureclosingamount,
          repledgetype: item.meta.repledgetype,
          lmsid: item.meta.unsecurelmsid,
          losid: item.meta.unsecurelosid,
          lender: (item.meta.unsecurelender || unsecuredLender),
          scheme: item.meta.oldscheme,
          ...(item.meta.oldunsecuredisbursalamount && item.meta.oldunsecurecharges && {
            olddisbursalamount: item.meta.oldunsecuredisbursalamount,
            oldunsecurecharges: item.meta.oldunsecurecharges,
          }),
        }))
        .value();

      unsecuredLoans = [
        {
          loantype: 'unsecure',
          lmsid: unsecuredLoan.meta.unsecurelmsid,
          losid: unsecuredLoan.meta.unsecurelosid,
          lender: (unsecuredLoan.meta.unsecurelender || unsecuredLender),
          loanamount: sumBy(order.items, 'meta.oldunsecureamount'),
          scheme: unsecuredLoan.meta.oldscheme,
          closingamount: sumBy(order.items, 'meta.unsecureclosingamount'),
          groupid: unsecuredLoan.meta.unsecurelosid,
          repledgetype: unsecuredLoan.meta.repledgetype,
          unsecurebifurcation,
        },
      ];
    }
  }
  const repledgeSLoans = map(order.items, (item) => ({
    loantype: 'secure',
    loanamount: item.meta.newsecureamount,
    lender: item.meta.lender,
    scheme: item.meta.newscheme,
    type: item.meta.newloantype,
    repledgetype: item.meta.repledgetype,
    groupid: item.meta.losid,
    totalDisbursalAmount: item.meta.totalDisbursalAmount,
    ...(item.meta.newsecuredisbursalamount && item.meta.newsecurecharges && {
      newdisbursalamount: item.meta.newsecuredisbursalamount,
      newsecurecharges: item.meta.newsecurecharges,
    }),
  }));
  const repledgeULoans = chain(order.items)
    .filter((item) => item.meta.newloantype === '1:1')
    .map((item) => ({
      loantype: 'unsecure',
      loanamount: item.meta.newunsecureamount,
      lender: (item.meta.unsecurelender || unsecuredLender),
      scheme: item.meta.newscheme,
      groupid: item.meta.losid,
      ...(item.meta.newunsecuredisbursalamount && item.meta.newunsecurecharges && {
        newdisbursalamount: item.meta.newunsecuredisbursalamount,
        newunsecurecharges: item.meta.newunsecurecharges,
      }),
    }))
    .value();

  const loans = chain([
    ...securedLoans,
    ...unsecuredLoans,
  ])
    .groupBy('groupid')
    .values()
    .map((cloan) => {
      const { type } = find(cloan, { loantype: 'secure' });
      return {
        type,
        loans: cloan,
      };
    })
    .value();
  const repledges = chain([
    ...repledgeSLoans,
    ...repledgeULoans,
  ])
    .groupBy('groupid')
    .values()
    .map((cloan) => {
      const { type, repledgetype } = find(cloan, { loantype: 'secure' });
      return {
        type,
        repledgetype,
        amount: sumBy(cloan, 'loanamount'),
        loans: cloan,
      };
    })
    .value();

  return {
    groups: loans,
    renewalgroups: repledges,
  };
};

/**
 * Create RenewalOrder
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const ordertype = await OrderType.findOne({ name: 'renewal', archived: false });
    const order = await RenewalOrder.createOrder(req.body, ordertype, req.user);
    return res.status(httpStatus.CREATED).json({ code: httpStatus.CREATED, message: 'Renewal Order created successfully', order: order.orderId });
  } catch (error) {
    return next(error);
  }
};

/**
 * Cancel RenewalOrder
 * @public
 */
exports.cancel = async (req, res, next) => {
  try {
    await RenewalOrder.cancelOrder(req.params.processId);
    return res.status(httpStatus.NO_CONTENT).end();
  } catch (error) {
    return next(error);
  }
};

/**
 * Read RenewalOrder
 * @public
 */
exports.read = async (req, res, next) => {
  try {
    const order = await RenewalOrder.findOne({
      orderId: req.params.orderId,
      customerId: req.user.id,
      status: {
        $ne: 'cancelled',
      },
    }).populate('type payment items');

    if (order) {
      const orderBankAccount = await OrderBankAccount.findOne({
        orderId: order._id,
      });

      const transformedData = order.toJSON();
      transformedData.bankAccount = { verificationLock: get(order, ['meta', 'lockbankverification'], false) };
      if (orderBankAccount) {
        transformedData.bankAccount = {
          verificationStatus: orderBankAccount.verificationStatus,
          retryCount: orderBankAccount.retryCount,
          verificationLock: order.meta.lockbankverification,
          pendingOtpRetryAttempts: orderBankAccount.pendingOtpRetryAttempts,
          pendingAccountEntryAttempts: orderBankAccount.pendingAccountEntryAttempts,
        };
      }

      return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Order fetched successfully', order: transformedData });
    }
    return res.status(httpStatus.BAD_REQUEST).json({ code: httpStatus.BAD_REQUEST, message: 'Resource not found or already processed' });
  } catch (error) {
    return next(error);
  }
};

/**
 * Active RenewalOrder
 * @public
 */
exports.active = async (req, res, next) => {
  try {
    const orders = await RenewalOrder.find({
      customerId: req.query.customer,
      status: {
        $in: [
          'pending',
          'processing',
          'cancellation_initiated',
        ],
      },
      paymentstatus: 'success',
    }).populate('items payment');

    const orderIds = map(orders, '_id');

    const orderBankAccounts = await OrderBankAccount.find({
      orderId: orderIds,
    });

    const transformedData = map(orders, (order) => {
      const orderBankAccount = find(orderBankAccounts, { orderId: order._id });
      let bankAccount = { verificationLock: get(order, ['meta', 'lockbankverification'], false) };

      if (!isEmpty(orderBankAccount)) {
        bankAccount = {
          verificationStatus: orderBankAccount.verificationStatus,
          retryCount: orderBankAccount.retryCount,
          verificationLock: order.meta.lockbankverification,
          pendingOtpRetryAttempts: orderBankAccount.pendingOtpRetryAttempts,
          pendingAccountEntryAttempts: orderBankAccount.pendingAccountEntryAttempts,
        };
      }

      return {
        request: order.orderId,
        amount: order.amount,
        signingstatus: order.signingstatus,
        paymentstatus: order.paymentstatus,
        accountverificationstatus: order.accountverificationstatus,
        otpconsentstatus: order.otpconsentstatus,
        status: order.status,
        locksign: order.locksign,
        tenureextension: order.meta.tenureextension,
        ...(order.payment && { paymentdate: moment(order.payment.updatedAt).unix() }),
        ...(order.signingmethod && { signingmethod: order.signingmethod.name }),
        ...renewalOrderData(order),
        bankAccount,
      };
    });

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: 'Order(s) fetched successfully',
      orders: transformedData,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * List DocSigning Methods
 * @public
 */
exports.listSigningMethods = async (req, res, next) => {
  try {
    const queryparams = {
      ...(req.query.source && {
        source: req.query.source,
      }),
    };
    const order = await RenewalOrder.findOne({
      orderId: req.params.orderId,
      customerId: req.user.id,
      status: {
        $in: [
          'created',
          'pending',
        ],
      },
      signingstatus: {
        $ne: 'success',
      },
    }).populate('items');

    if (order) {
      const signingtypes = await RenewalOrder.listSigningMethods(order, req.user, queryparams);
      return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Signing Method(s) fetched successfully', methods: signingtypes });
    }
    return res.status(httpStatus.BAD_REQUEST).json({ code: httpStatus.BAD_REQUEST, message: 'Resource not found or already processed' });
  } catch (error) {
    return next(error);
  }
};

/**
 * List Payment Methods
 * @public
 */
exports.listPaymentMethods = async (req, res, next) => {
  try {
    const order = await RenewalOrder.findOne({
      orderId: req.params.orderId,
      customerId: req.user.id,
      status: 'pending',
      paymentstatus: {
        $ne: 'success',
      },
    }).populate('items type');

    if (order) {
      const response = await RenewalOrder.listPaymentMethods(order, req.user);
      return res.status(httpStatus.OK).json({
        code: httpStatus.OK,
        message: 'Payment Method(s) fetched successfully',
        methods: response,
        ...(req.query.includes && includes(req.query.includes.split(','), 'order') && { order: omit(order, ['items']) }),
      });
    }
    return res.status(httpStatus.BAD_REQUEST).json({ code: httpStatus.BAD_REQUEST, message: 'Resource not found or already processed' });
  } catch (error) {
    return next(error);
  }
};

/**
 * List DocSigning Methods
 * @public
 */
exports.listESign = async (req, res, next) => {
  try {
    const order = await RenewalOrder.findOne({
      orderId: req.params.orderId,
      customerId: req.user.id,
      status: 'pending',
      'signingmethod.name': 'esign',
      paymentstatus: 'success',
      signingstatus: {
        $ne: 'success',
      },
    }).populate('signingrequests');

    if (order) {
      const signingrequests = await DocSignService.listRequests({
        order: order._id.toString(),
        type: order.signingmethod.id,
      });
      const requestIDs = map(order.signingrequests, (request) => request.requestId);
      const transformedData = chain(signingrequests)
        .filter((request) => includes(requestIDs, request._id))
        .map((request) => pick(request, ['status', 'signeddocument', 'signurl', 'custom']))
        .value();
      return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Signing Request(s) fetched successfully', signingrequests: transformedData });
    }
    return res.status(httpStatus.BAD_REQUEST).json({ code: httpStatus.BAD_REQUEST, message: 'Resource not found or already processed' });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update DocSigning Methods
 * @public
 */
exports.updateSigningMethod = async (req, res, next) => {
  try {
    const order = await RenewalOrder.findOneAndUpdate({
      orderId: req.params.orderId,
      customerId: req.user.id,
      status: {
        $in: [
          'created',
          'pending',
        ],
      },
      signingstatus: {
        $ne: 'success',
      },
    }, {
      status: 'pending',
      signingmethod: req.body,
      signingstatus: 'pending',
      'timestamps.pending': moment().toISOString(),
    }, {
      new: true,
    });

    if (order) {
      await RenewalOrder.updateSigningMethod(order);
      return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Signing Method updated successfully' });
    }
    return res.status(httpStatus.BAD_REQUEST).json({ code: httpStatus.BAD_REQUEST, message: 'Resource not found or already processed' });
  } catch (error) {
    return next(error);
  }
};

/**
 * Send DocSigning SMS
 * @public
 */
exports.sendSigningSMS = async (req, res, next) => {
  try {
    const order = await RenewalOrder.findOne({
      orderId: req.params.orderId,
      status: 'pending',
      paymentstatus: 'success',
      signingstatus: {
        $ne: 'success',
      },
    });
    if (order) {
      await RenewalOrder.sendSigningSMS(order, req.body.type, req.body.lock);
      return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Signing SMS sent successfully' });
    }
    return res.status(httpStatus.BAD_REQUEST).json({ code: httpStatus.BAD_REQUEST, message: 'Resource not found or already processed' });
  } catch (error) {
    return next(error);
  }
};

/**
 * Verify DigiSign
 * @public
 */
exports.verifyDigiSign = async (req, res, next) => {
  try {
    const order = await RenewalOrder.findOne({
      orderId: req.params.orderId,
      customerId: req.user.id,
      'signingmethod.name': { $in: ['digital', '2fa'] },
      status: 'pending',
      signingstatus: {
        $ne: 'success',
      },
    }).populate('signingrequests');

    if (order && order.signingrequests.length > 0) {
      const [request] = order.signingrequests;
      const response = await DocSignService.verifyDigiSign(request.requestId, {
        otp: req.body.otp,
      });

      return res.status(httpStatus.OK).json({
        code: httpStatus.OK,
        message: response.message,
        data: pick(response.request, ['attempts', 'status']),
      });
    }
    return res.status(httpStatus.BAD_REQUEST).json({ code: httpStatus.BAD_REQUEST, message: 'Resource not found or already processed' });
  } catch (error) {
    return next(error);
  }
};

/**
 * Fetch DigiSign Code
 * @public
 */
exports.fetchDigiSignCode = async (req, res, next) => {
  try {
    const renewalorderSearchCriteria = {
      orderId: req.params.orderId,
      customerId: req.user.id,
      'signingmethod.name': { $in: ['digital', '2fa'] },
      status: 'pending',
      signingstatus: {
        $ne: 'success',
      },
    };
    const order = await RenewalOrder.findOne(renewalorderSearchCriteria).populate('signingrequests');

    if (order && order.signingrequests.length > 0) {
      if (order.otplimit === 0) {
        return res.status(httpStatus.BAD_REQUEST).json({ code: httpStatus.BAD_REQUEST, message: 'OTP has been send too many time. This order cannot be processed anymore through OTP' });
      }
      const [request] = order.signingrequests;
      const provider = await getDigitSignProviders(notificationProviderMap[req.body.provider]);
      await DocSignService.digiSignOTP(request.requestId, { provider });
      await RenewalOrder.findOneAndUpdate(renewalorderSearchCriteria, {
        $inc: { otplimit: -1 },
      });

      return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Verification code sent successfully' });
    }
    return res.status(httpStatus.BAD_REQUEST).json({ code: httpStatus.BAD_REQUEST, message: 'Resource not found or already processed' });
  } catch (error) {
    return next(error);
  }
};

/**
 * View Unsigned Document
 * @public
 */
exports.viewUnSignedDoc = async (req, res, next) => {
  try {
    const order = await RenewalOrder.findOne({
      orderId: req.params.orderId,
      customerId: req.user.id,
      status: 'pending',
      signingstatus: {
        $ne: 'success',
      },
      signingmethod: {
        $exists: true,
      },
    }).populate('items');

    if (order) {
      const data = {
        loandetails: map(order.items, (item) => ({
          ...item.meta,
          loanid: item.meta.losid,
          ...(item.meta.oldunsecureamount && { oldunsecureamount: item.meta.oldunsecureamount }),
          newunsecureamount: item.meta.newunsecureamount,
          oldschemeid: item.meta.oldscheme.id,
          newschemeid: item.meta.newscheme.id,
          oldloandate: moment(item.meta.oldloandate).format('YYYY-MM-DD'),
          newloandate: moment(item.meta.newloandate).format('YYYY-MM-DD'),
        })),
        signtype: coreSigningMethodMap[order.signingmethod.name],
      };
      const response = await CoreService.viewUnSignedPC(req.user.token, data);
      return res.status(httpStatus.OK).json({
        code: httpStatus.OK,
        message: response.UserMsg,
        docurl: response.link,
      });
    }
    return res.status(httpStatus.BAD_REQUEST).json({ code: httpStatus.BAD_REQUEST, message: 'Resource not found or already processed' });
  } catch (error) {
    return next(error);
  }
};

/**
 * View signed Document
 * @public
 */
exports.viewSignedDoc = async (req, res, next) => {
  try {
    const order = await RenewalOrder.findOne({
      orderId: req.params.orderId,
      customerId: req.user.id,
      status: 'processing',
      signingstatus: 'success',
      paymentstatus: 'success',
    }).populate('items');

    if (order) {
      const response = await CoreService.getSignedPC(req.user.token, order._id.toString());
      return res.status(httpStatus.OK).json({
        code: httpStatus.OK,
        message: response.UserMsg,
        docurl: {
          secured: response.signedpcurl,
          ...(response.usignedpcurl && { unsecured: response.usignedpcurl }),
          ...(response.summarypcurl && { summary: response.summarypcurl }),
          ...(response.lesummarypcurl && { lesummary: response.lesummarypcurl }),
        },
        lender: {
          secure: uniq(compact(map(order.items, (item) => item.meta.lender))),
          unsecure: uniq(compact(map(order.items, (item) => item.meta.unsecurelender))),
        },
      });
    }
    return res.status(httpStatus.BAD_REQUEST).json({ code: httpStatus.BAD_REQUEST, message: 'Resource not found or already processed' });
  } catch (error) {
    return next(error);
  }
};

/**
 * Generate Payment Link
 * @public
 */
exports.generatePayLink = async (req, res, next) => {
  try {
    const order = await RenewalOrder.findOne({
      orderId: req.params.orderId,
      customerId: req.user.id,
      status: 'pending',
      paymentstatus: {
        $ne: 'success',
      },
    }).populate('items type');

    if (order) {
      const response = await RenewalOrder.generatePayLink(order, req.user, req.body);
      return res.status(httpStatus.OK).json({
        code: httpStatus.OK,
        message: response.UserMsg,
        data: {
          link: response.link,
          lenderid: response.lenderid,
        },
      });
    }
    return res.status(httpStatus.BAD_REQUEST).json({ code: httpStatus.BAD_REQUEST, message: 'Resource not found or already processed' });
  } catch (error) {
    return next(error);
  }
};

/**
 * Fetches OTP
 * @public
 */
exports.getOtpFromOrderId = async (req, res, next) => {
  try {
    const order = await RenewalOrder.findOne({
      orderId: req.params.orderId,
      customerId: req.user.id,
      'signingmethod.name': { $in: ['digital', '2fa'] },
      status: 'pending',
      signingstatus: {
        $ne: 'success',
      },
    }).populate('signingrequests');

    if (order) {
      const signingrequests = await DocSignService.listRequests({
        order: order._id.toString(),
        type: order.signingmethod.id,
      });
      const requestIDs = map(order.signingrequests, (request) => request.requestId);
      const transformedData = chain(signingrequests)
        .filter((request) => includes(requestIDs, request._id))
        .value();

      if (transformedData.length) {
        return res.status(httpStatus.OK).json({
          code: httpStatus.OK,
          message: 'OTP fetch sucessfully',
          otp: transformedData[0].otp,
        });
      }
    }
    return res.status(httpStatus.BAD_REQUEST).json({ code: httpStatus.BAD_REQUEST, message: 'Resource not found or already processed' });
  } catch (error) {
    return next(error);
  }
};

/**
 * update RenewalOrder
 * @public
 */
exports.updateOrder = async (req, res, next) => {
  try {
    const signingmethod = await getTypes({ name: req.body.signingmethod }, 'array');
    const order = await RenewalOrder.findOneAndUpdate({
      _id: req.params.orderId,
      customerId: req.user.id,
      status: {
        $in: [
          'created',
          'pending',
        ],
      },
    }, {
      signingstatus: req.body.signingstatus,
      signingmethod: signingmethod[0] ? signingmethod[0] : { name: req.body.signingmethod },
    }, {
      new: true,
    });
    await ZeebeService.publishMessage(order._id.toString(), 'order_update_event', {
      orderid: order._id.toString(),
      signingstatus: order.signingstatus,
      signingmethod: order.signingmethod.name,
    });
    return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Renewal Order updated successfully', order });
  } catch (error) {
    return next(error);
  }
};

/**
 * Create RenewalOrder For Kgl Loan
 * @public
 */
exports.createOrderForKgl = async (req, res, next) => {
  try {
    const ordertype = await OrderType.findOne({ name: 'renewal', archived: false });
    const order = await RenewalOrder.createOrder(req.body, ordertype, req.user, true);
    return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Renewal Order updated successfully', orderData: { _id: order._id, order } });
  } catch (error) {
    return next(error);
  }
};

/**
 * Lock Bank Verification
 * @public
 */
exports.lockBankVerification = async (req, res, next) => {
  try {
    const order = await RenewalOrder.findOne({
      orderId: req.params.orderId,
      paymentstatus: 'success',
      signingstatus: 'success',
    });
    if (order) {
      await RenewalOrder.lockBankVerification(order);
      return res.status(httpStatus.OK).json({ code: httpStatus.OK, message: 'Lock bank verification done successfully' });
    }
    return res.status(httpStatus.BAD_REQUEST).json({ code: httpStatus.BAD_REQUEST, message: 'Resource not found or already processed' });
  } catch (error) {
    return next(error);
  }
};

exports.initiateCancellation = async (req, res, next) => {
  try {
    const {
      orderId,
      cancellationReason,
      cancellationComment,
    } = req.body;
    const order = await RenewalOrder.findOneAndUpdate({
      orderId,
      $nor: [
        { status: 'cancellation_initiated' },
        { status: 'cancelled' },
      ],
      signingstatus: {
        $ne: 'success',
      },
    }, {
      'meta.cancelledBy': req.user.id,
    });

    if (order) {
      await RenewalOrder.update({ orderId }, { cancellationReason, cancellationComment });
      await ZeebeService.publishMessage(order._id.toString(), 'cancellation_initiation_event');

      return res.status(httpStatus.OK).json({
        code: httpStatus.OK,
        message: 'Order cancellation initiated',
      });
    }

    return res.status(httpStatus.BAD_REQUEST).json({
      code: httpStatus.BAD_REQUEST,
      message: 'Resource not found or already processed',
    });
  } catch (error) {
    return next(error);
  }
};

/*
Returns the Aadhar Validation Status
*/
exports.aadharVerificationStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await RenewalOrder.findOne({
      orderId,
      customerId: req.user.id,
      status: {
        $in: [
          'created',
          'pending',
        ],
      },
      signingstatus: {
        $ne: 'success',
      },
    });
    if (order) {
      if (isAadharVerificationValid(order.aadharverification)) {
        return res.status(httpStatus.OK).json({
          code: httpStatus.OK,
          verificationstatus: order.aadharverification.status,
          message: 'Aadhar Verification status Successfully fetched',
        });
      }

      return res.status(httpStatus.OK).json({
        code: httpStatus.OK,
        verificationstatus: false,
      });
    }
    return res.status(httpStatus.BAD_REQUEST).json({ code: httpStatus.BAD_REQUEST, message: 'Resource not found or already processed' });
  } catch (error) {
    return next(error);
  }
};

/*
Validates the Aadhar Suffix
*/
exports.validateAadhar = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await RenewalOrder.findOne({
      orderId,
      customerId: req.user.id,
      status: {
        $in: [
          'created',
          'pending',
        ],
      },
      signingstatus: {
        $ne: 'success',
      },
    });
    if (order) {
      const response = await KycService.validateAadhar(req.user.id, req.body);
      const status = isEqual('success', response.status.toLowerCase());
      await RenewalOrder.findOneAndUpdate({
        orderId,
      }, {
        aadharverification: {
          status,
          lastAttemptedAt: moment().toISOString(),
        },
      });
      return res.status(httpStatus.OK).json({
        code: httpStatus.OK,
        message: status ? aadharVerification.verified : aadharVerification.notverified,
        verificationstatus: status,
      });
    }
    return res.status(httpStatus.BAD_REQUEST).json({ code: httpStatus.BAD_REQUEST, message: 'Resource not found or already processed' });
  } catch (error) {
    return next(error);
  }
};

/*
Pin verification
*/
exports.pinVerification = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await RenewalOrder.findOne({
      orderId,
      customerId: req.user.id,
      status: {
        $in: [
          'created',
          'pending',
        ],
      },
      signingstatus: {
        $ne: 'success',
      },
    });
    if (order && order.aadharverification) {
      const { aadharverification } = order;
      if (aadharverification.status) {
        await ZeebeService.publishMessage(order._id.toString(), '2fa_verification_event', {
          pinverification: 'success',
        });
      }
      return res.status(httpStatus.OK).json({
        code: httpStatus.OK,
        message: aadharverification.status ? 'Aadhar and PIN are Verified' : 'Aadhar is not Verified',
      });
    }
    return res.status(httpStatus.BAD_REQUEST).json({ code: httpStatus.BAD_REQUEST, message: 'Resource not found or already processed' });
  } catch (error) {
    return next(error);
  }
};
