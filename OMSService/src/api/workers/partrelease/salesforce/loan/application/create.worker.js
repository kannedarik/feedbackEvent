const { get } = require('lodash');
const RupeekService = require('../../../../../services/rupeek.service');
const LASService = require('../../../../../services/las.service');
const ErrorHandler = require('../../../../../utils/error');
const { logger } = require('../../../../../../config/logger');
const constants = require('../../../../../utils/constants');

module.exports = () => ({
  taskType: 'partrelease.salesforce.loan.application.create',
  taskHandler: async (job) => {
    try {
      const { token, leadId } = job.variables;
      const activeTransaction = await RupeekService.fetchActiveTransaction(token, {
        requestid: job.variables.partreleaseTransactionId,
        cityid: job.variables.cityId,
      });
      const data = {
        loan_type: constants.loanApplication.loanType,
        loan_amount: job.variables.loanAmount,
        reason: job.variables.reason,
        city_id: job.variables.cityId,
        system_source: constants.loanApplication.systemSource,
        rupeek_offer: job.variables.loanAmount,
        rupeek_lender: job.variables.rupeekLender,
        rupeek_lender_branch: job.variables.rupeekLenderBranch,
        master_scheme_id: job.variables.rupeekScheme,
        is_co_borrower: get(activeTransaction, 'loan.iscoborrower', false),
        transaction_place_type: constants.loanApplication.transactionPlaceType,
        is_part_release_fresh: true,
      };
      const newLoanApplicationId = await LASService.create(token, leadId, data);
      logger.info(`Loan application creation successful. Response: ${JSON.stringify(newLoanApplicationId)}`);

      job.complete({
        newLoanApplicationId,
        activeTransaction,
      });
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      job.fail(err.message);
    }
  },
});
