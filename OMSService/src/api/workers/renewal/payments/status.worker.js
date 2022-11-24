const { chain } = require('lodash');
const PaymentService = require('../../../services/payment.service');
const ErrorHandler = require('../../../utils/error');
const { supportJwtToken } = require('../../../../config/vars');
const { paymentLoanStatus } = require('../../../utils/constants');

module.exports = () => ({
  taskType: 'renewal.payments.status',
  taskHandler: async (job) => {
    try {
      const securedLoanIDs = chain(job.variables.loans.payments)
        .filter({ loantype: 'secure' })
        .map((loan) => loan.losid)
        .value();
      const unsecuredLoanIDs = job.variables.ispartial ? [] : chain(job.variables.loans.payments)
        .filter({ loantype: 'unsecure' })
        .map((loan) => loan.losid)
        .value();

      const data = {
        status: job.variables.tenureextension ? paymentLoanStatus.open : paymentLoanStatus.close,
        repledged: true,
        tenureextension: job.variables.tenureextension,
        loanid: [
          ...securedLoanIDs,
          ...unsecuredLoanIDs,
        ],
      };

      await PaymentService.updateLoanStatus(supportJwtToken, data);

      job.complete();
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      job.fail(err.message);
    }
  },
});
