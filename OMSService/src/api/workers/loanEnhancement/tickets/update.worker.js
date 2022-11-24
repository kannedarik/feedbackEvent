const _ = require('lodash');
const moment = require('moment');
const SupportService = require('../../../services/support.service');
const MoneyRoutingService = require('../../../services/money_routing.service');
const ErrorHandler = require('../../../utils/error');
const OrderBankAccount = require('../../../models/orderbankaccount.model');
const RenewalOrder = require('../../../models/renewalorder.model');

module.exports = () => ({
  taskType: 'loanEnhancement.tickets.update',
  taskHandler: async (job) => {
    try {
      const orderBankAccount = await OrderBankAccount.findOne({
        orderId: job.variables.orderid,
      });

      const order = await RenewalOrder.findOne({ _id: job.variables.orderid });

      const customerBankAccounts = await MoneyRoutingService.listBankAccounts(job.variables.customer, true);

      let bankAccount = { verificationLock: _.get(order, ['meta', 'lockbankverification'], false) };
      if (orderBankAccount) {
        bankAccount = _.find(customerBankAccounts.data, {
          accountNumber: orderBankAccount.accountNumber,
          customerId: job.variables.customer.id,
        });
      }

      const pennyTestingStatus = job.variables.lockbankverification
        ? 'manual'
        : order.accountverificationstatus;

      const otpConsentStatus = job.variables.lockbankverification
        ? 'manual'
        : order.otpconsentstatus;

      await SupportService.updateLoanEnhancementStatus(job.variables.orderid, {
        digital_sign_status: job.variables.locksign ? 'manual' : job.variables.signingstatus,
        digital_sign_type: job.variables.signingmethod,
        digital_sign_timestamp: moment().valueOf(),
        ...(!_.isEmpty(bankAccount) && {
          account_number: bankAccount.accountNumber,
          ifsc_code: bankAccount.ifsc,
          bank_name: bankAccount.bankName,
          a_c_timestamp: moment(bankAccount.createdAt).valueOf(),
        }),
        ...((_.includes(['failure', 'manual'], otpConsentStatus)
        || (!_.isEmpty(bankAccount) && bankAccount.accountNumber)) && {
          otp_consent_status: otpConsentStatus,
        }),
        penny_testing_status: pennyTestingStatus,
        ...(orderBankAccount && {
          a_c_entry_attempts: orderBankAccount.accountEntryAttempts,
          otp_timestamp: moment(orderBankAccount.statusUpdatedAt).valueOf(),
          otp_consent_attempts: orderBankAccount.retryCount,
        }),
      });

      job.complete();
    } catch (err) {
      if (job.variables.ignoreticketupdate) {
        job.complete();
      }
      ErrorHandler.captureWFError(job, err);
      job.fail(err.message);
    }
  },
});
