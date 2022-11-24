const {
  chain,
  map,
  sumBy,
  find,
  get,
  isEmpty,
} = require('lodash');
const moment = require('moment');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Order = require('../../../models/order.model');
const OrderBankAccount = require('../../../models/orderbankaccount.model');
const OrderItem = require('../../../models/orderitem.model');
const NotificationService = require('../../../services/notification.service');
const MoneyRoutingService = require('../../../services/money_routing.service');
const CoreCache = require('../../../utils/cache/core');
const Constants = require('../../../utils/constants');
const NotificationCache = require('../../../utils/cache/notification');
const ErrorHandler = require('../../../utils/error');
const { loantypemapping } = require('../../../utils/constants');

const renewalAmountType = 'LE Amount';

const isPositiveNumber = (n) => Number(n) === n && n > 0;

const formatData = (items, renewaltype) => {
  if (renewaltype === 'N:1') {
    const [unsecuredLoan] = items;
    return {
      combined: true,
      renewaltype: unsecuredLoan.meta.oldloantype ? loantypemapping[unsecuredLoan.meta.oldloantype] : renewaltype, // eslint-disable-line max-len
      secured: map(items, (item, idx) => ({
        idx: idx + 1,
        lmsid: item.meta.lmsid,
        loanamount: item.meta.oldsecureamount,
        closingamount: item.meta.secureclosingamount,
        rebookamount: item.meta.newsecureamount,
        rebate: item.meta.securecashback,
        excessamount: item.meta.secureexcessfunding,
        securenextworkingdayinterest: item.meta.securenextworkingdayinterest,
        securenextworkingdaycashback: item.meta.securenextworkingdaycashback,
        unsecurerebookamount: item.meta.newloantype === '1:1' ? item.meta.newunsecureamount : '--',
        leAmount: item.meta.totalDisbursalAmount,
        recommendedDebit: item.meta.totalEligibilityAmount - item.meta.totalDisbursalAmount,
        renewalAmountType,
        /* Secure Processing fee charges */
        ...(isPositiveNumber(item.meta.secureprocessingfeecharge) && {
          hasProcessingFee: isPositiveNumber(item.meta.secureprocessingfeecharge),
          processingFeeCharge: get(find(item.meta.newsecurecharges, { chargeType: 'processing-fee' }), 'chargeAmount', '--'),
          newSecureDisbursalAmount: item.meta.newsecuredisbursalamount,
          gst: get(find(item.meta.newsecurecharges, { chargeType: 'processing-fee' }), 'taxAmount', '--'),
        }),
      })),
      ...(unsecuredLoan.meta.oldloantype === 'N:1' && {
        unsecured: {
          lmsid: unsecuredLoan.meta.unsecurelmsid,
          loanamount: sumBy(items, 'meta.oldunsecureamount'),
          closingamount: sumBy(items, 'meta.unsecureclosingamount'),
          rebate: sumBy(items, 'meta.unsecurecashback'),
          excessamount: sumBy(items, 'meta.unsecureexcessfunding'),
          /* Unsecure Processing fee charges */
          ...(isPositiveNumber(unsecuredLoan.meta.unsecureprocessingfeecharge) && {
            hasProcessingFee: isPositiveNumber(unsecuredLoan.meta.unsecureprocessingfeecharge),
            processingFeeCharge: get(find(unsecuredLoan.meta.newunsecurecharges, { chargeType: 'processing-fee' }), 'chargeAmount', '--'),
            newUnSecureDisbursalAmount: unsecuredLoan.meta.newunsecuredisbursalamount,
            gst: get(find(unsecuredLoan.meta.newunsecurecharges, { chargeType: 'processing-fee' }), 'taxAmount', '--'),
          }),
          unsecurenextworkingdayinterest: unsecuredLoan.meta.unsecurenextworkingdayinterest,
          unsecurenextworkingdaycashback: unsecuredLoan.meta.unsecurenextworkingdaycashback,
        },
      }),
      daysinnextworkingday: unsecuredLoan.meta.daysinnextworkingday,
    };
  }

  return {
    combined: false,
    loans: map(items, (item) => ({
      renewaltype: item.meta.oldloantype ? loantypemapping[item.meta.oldloantype] : renewaltype,
      secured: {
        lmsid: item.meta.lmsid,
        loanamount: item.meta.oldsecureamount,
        closingamount: item.meta.secureclosingamount,
        rebookamount: item.meta.newsecureamount,
        rebate: item.meta.securecashback,
        excessamount: item.meta.secureexcessfunding,
        securenextworkingdayinterest: item.meta.securenextworkingdayinterest,
        securenextworkingdaycashback: item.meta.securenextworkingdaycashback,
        unsecurerebookamount: item.meta.newloantype === '1:1' ? item.meta.newunsecureamount : '--',
        leAmount: item.meta.totalDisbursalAmount,
        recommendedDebit: item.meta.totalEligibilityAmount - item.meta.totalDisbursalAmount,
        renewalAmountType,
        /* Secure Processing fee charges */
        ...(isPositiveNumber(item.meta.secureprocessingfeecharge) && {
          hasProcessingFee: isPositiveNumber(item.meta.secureprocessingfeecharge),
          processingFeeCharge: get(find(item.meta.newsecurecharges, { chargeType: 'processing-fee' }), 'chargeAmount', '--'),
          newSecureDisbursalAmount: item.meta.newsecuredisbursalamount,
          gst: get(find(item.meta.newsecurecharges, { chargeType: 'processing-fee' }), 'taxAmount', '--'),
        }),
      },
      ...(item.meta.oldloantype === '1:1' && {
        unsecured: {
          lmsid: item.meta.unsecurelmsid,
          loanamount: item.meta.oldunsecureamount,
          closingamount: item.meta.unsecureclosingamount,
          rebate: item.meta.unsecurecashback,
          excessamount: item.meta.unsecureexcessfunding,
          /* Unsecure Processing fee charges */
          ...(isPositiveNumber(item.meta.unsecureprocessingfeecharge) && {
            hasProcessingFee: isPositiveNumber(item.meta.unsecureprocessingfeecharge),
            processingFeeCharge: get(find(item.meta.newunsecurecharges, { chargeType: 'processing-fee' }), 'chargeAmount', '--'),
            newUnSecureDisbursalAmount: item.meta.newunsecuredisbursalamount,
            gst: get(find(item.meta.newunsecurecharges, { chargeType: 'processing-fee' }), 'taxAmount', '--'),
          }),
          unsecurenextworkingdayinterest: item.meta.unsecurenextworkingdayinterest,
          unsecurenextworkingdaycashback: item.meta.unsecurenextworkingdaycashback,
        },
      }),
      daysinnextworkingday: item.meta.daysinnextworkingday,
    })),
  };
};

module.exports = () => ({
  taskType: 'loanEnhancement.tickets.create',
  taskHandler: async (job) => {
    try {
      const [category, provider, type, template] = await Promise.all([
        NotificationCache.getCategories(job.customHeaders.category),
        NotificationCache.getProviders(job.customHeaders.provider),
        NotificationCache.getTypes(job.customHeaders.type),
        NotificationCache.getTemplates(job.customHeaders.template),
      ]);

      const items = await OrderItem.find({
        orderId: mongoose.Types.ObjectId(job.variables.orderid),
        'meta.repledgetype': Constants.repledgeType.LOAN_ENHANCEMENT,
      }).lean();

      if (isEmpty(items)) {
        return job.complete();
      }

      const order = await Order.findOne({ _id: job.variables.orderid });

      const orderBankAccount = await OrderBankAccount.findOne({
        orderId: job.variables.orderid,
      });

      const customerBankAccounts = await MoneyRoutingService.listBankAccounts(
        job.variables.customer, true,
      );

      let bankAccount = null;
      if (orderBankAccount) {
        bankAccount = find(customerBankAccounts.data, {
          accountNumber: orderBankAccount.accountNumber,
        });
      }

      const [securedLoan] = items;
      const [lender] = await CoreCache.getLenders({ id: securedLoan.meta.lenderid }, 'array');
      const branch = find(lender.branches, { id: securedLoan.meta.branchid });

      const securedGLNumbers = job.variables.loans ? chain(job.variables.loans.payments)
        .filter({ loantype: 'secure' })
        .map((loan) => loan.lmsid)
        .value() : map(items, (item) => item.meta.lmsid);
      const unsecuredGLnumbers = job.variables.loans ? chain(job.variables.loans.payments)
        .filter({ loantype: 'unsecure' })
        .map((loan) => loan.lmsid)
        .value() : [];
      const securedLOSIDs = job.variables.loans ? chain(job.variables.loans.payments)
        .filter({ loantype: 'secure' })
        .map((loan) => loan.losid)
        .value() : map(items, (item) => item.meta.lmsid);
      const unsecuredLOSIDs = job.variables.loans ? chain(job.variables.loans.payments)
        .filter({ loantype: 'unsecure' })
        .map((loan) => loan.losid)
        .value() : [];
      const transformedData = formatData(items, job.variables.renewaltype);
      const { tenureextensioncriteria } = job.variables;

      let otpConsentStatus = order.otpconsentstatus;
      let pennyTestingStatus = order.accountverificationstatus;

      let loanEnhancementStatus;
      if (job.variables.signingstatus === 'success') {
        if (orderBankAccount && orderBankAccount.verificationStatus === 'verification_successful') {
          loanEnhancementStatus = 'success';
          otpConsentStatus = 'success';
          pennyTestingStatus = 'success';
        } else if ((orderBankAccount && orderBankAccount.verificationStatus === 'verification_pending')
          || (orderBankAccount && orderBankAccount.verificationStatus === 'otp_sent')) {
          loanEnhancementStatus = 'pending';
        } else {
          loanEnhancementStatus = 'pending';
        }
      } else {
        loanEnhancementStatus = 'failure';
      }

      const data = {
        customer: {
          id: job.variables.customer.id,
          phone: job.variables.phone,
        },
        category,
        type,
        provider,
        template: {
          id: template,
          data: {
            ...transformedData,
            name: job.variables.customer.name,
            phone: job.variables.phone,
            ispartial: job.variables.ispartial ? 'Partial Renewal' : 'Full Renewal',
            ispartialLE: job.variables.ispartialLE ? 'Partial LE of N:1' : 'Full LE of N:1',
            tenureextension: job.variables.tenureextension,
            ...(tenureextensioncriteria && {
              lessthanloanamount: tenureextensioncriteria === 'loanamount',
              lessthanoutstandingamount: tenureextensioncriteria === 'outstandingamount',
            }),
          },
        },
        correlationid: uuidv4(),
        custom: {
          loanEnhancementStatus,
          processType: 'loanEnhancement',
          customerId: job.variables.customer.id,
          customerPhone: job.variables.phone,
          lenderId: lender.id,
          branchId: branch.id,
          lenderName: lender.name,
          lenderBranch: branch.branchname,
          city: branch.city,
          loanId: [
            ...securedLOSIDs,
            ...unsecuredLOSIDs,
          ],
          lmsId: [
            ...securedGLNumbers,
            ...unsecuredGLnumbers,
          ],
          signingType: job.variables.signingmethod,
          signingStatus: job.variables.locksign ? 'manual' : job.variables.signingstatus,
          signingTime: moment().valueOf(),
          orderId: job.variables.orderid,
          loanType: job.variables.renewaltype,
          general_ledger: items.map(OrderItem.toOldLoanGeneralLedger),
          ...(bankAccount && bankAccount.accountNumber && {
            bankAccount: {
              accountNumber: bankAccount.accountNumber,
              bankName: bankAccount.bankName,
              ifsc: bankAccount.ifsc,
              beneficiaryName: bankAccount.beneficiaryName,
              otpConsentAttempts: orderBankAccount.retryCount,
              pennyTestingStatus,
              otpConsentStatus,
              otpTimestamp: orderBankAccount.statusUpdatedAt,
              accountEntryAttempts: orderBankAccount.accountEntryAttempts,
              accountEntryTimestamp: orderBankAccount.latestAccountEntryAt,
            },
          }),
        },
      };
      await NotificationService.sendTicket(data);

      return job.complete({
        loanEnhancementTicketCreated: true,
        ignoreticketupdate: false,
      });
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      return job.fail(err.message);
    }
  },
});
