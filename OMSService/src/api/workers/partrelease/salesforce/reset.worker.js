/* eslint-disable max-len */
const RupeekService = require('../../../services/rupeek.service');
const ErrorHandler = require('../../../utils/error');

const fetchEta = (jobVariables) => {
  const {
    isPISlot,
    isRelatedLoan,
    timeslotstart,
    timeslotend,
  } = jobVariables;
  const etaObject = {
    timeslotstart,
    timeslotend,
  };
  return (isPISlot && isRelatedLoan ? {} : etaObject);
};

const fetchNotesAndAmount = (jobVariables) => {
  const {
    requestedAmount,
    notes,
    isPISlot,
    isRelatedLoan,
    isRescheduling,
  } = jobVariables;
  const notesAndAmountObject = {
    requestedamount: requestedAmount,
    exceptionnotes: notes,
  };
  return ((!isRelatedLoan && isRescheduling) || (isPISlot && isRescheduling) ? {} : notesAndAmountObject);
};

module.exports = () => ({
  taskType: 'partrelease.salesforce.reset',
  taskHandler: async (job) => {
    try {
      const data = {
        isscheduled: true,
        requestid: job.variables.freshLoanId,
        cityid: job.variables.cityId,
        ...fetchEta(job.variables),
        ...fetchNotesAndAmount(job.variables),
      };
      await RupeekService.resetTransactionStatus(job.variables.token, data);

      return job.complete();
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      return job.fail();
    }
  },
});
