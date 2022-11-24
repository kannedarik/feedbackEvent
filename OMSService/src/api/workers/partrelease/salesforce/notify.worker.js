/* eslint-disable max-len */
const SupportService = require('../../../services/support.service');
const ErrorHandler = require('../../../utils/error');
const { caseCreationDetails } = require('../../../utils/constants');

module.exports = () => ({
  taskType: 'partrelease.salesforce.notify',
  taskHandler: async (job) => {
    const {
      loans,
      partreleaseTransactionId,
      isRelatedLoan,
      caseRecordType,
      isRescheduling,
      productCategory,
      newloanrequest,
    } = job.variables;
    try {
      const data = {
        isSlotConfirmed: true,
        loanId: parseInt(loans[0], 10),
        transactionId: partreleaseTransactionId,
        isRelatedLoan,
        caseRecordType,
        ...(!isRescheduling && !isRelatedLoan && productCategory === caseCreationDetails.productCategory && {
          freshLoanTransactionId: newloanrequest.requestid,
        }),
      };
      await SupportService.notifyOnSlotConfirmation(data);

      return job.complete();
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      return job.fail();
    }
  },
});
