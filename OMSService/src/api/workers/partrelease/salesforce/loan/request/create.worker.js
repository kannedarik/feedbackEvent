const { get } = require('lodash');
const RupeekService = require('../../../../../services/rupeek.service');
const ErrorHandler = require('../../../../../utils/error');

module.exports = () => ({
  taskType: 'partrelease.salesforce.loan.request.create',
  taskHandler: async (job) => {
    try {
      const data = {
        phone: job.variables.phone,
        address: job.variables.address,
        category: 'other',
        lpid: job.variables.rupeekLender,
        loanapplicationid: job.variables.newLoanApplicationId,
        requestedamount: job.variables.loanAmount,
        timeslotstart: job.variables.timeslotstart,
        timeslotend: job.variables.timeslotend,
        cityid: job.variables.cityId,
        location: job.variables.location,
        isscheduled: true,
        istakeover: false,
        exceptionnotes: job.variables.notes,
        branchid: job.variables.rupeekLenderBranch,
        masterschemeid: job.variables.rupeekScheme,
        isinternaltakeover: false,
        city: job.variables.city,
        ...(job.variables.locality && { locality: job.variables.locality }),
        ...(job.variables.addressparts && { addressparts: job.variables.addressparts }),
        ...(job.variables.activeTransaction && {
          is_co_borrower: get(job.variables.activeTransaction, 'loan.iscoborrower', false),
          co_borrower_details: get(job.variables.activeTransaction, 'loan.coborrowerdetails', ''),
        }),
        is_part_release_fresh: true,
        parentpartreleasetransaction: job.variables.partreleaseTransactionId,
      };
      const response = await RupeekService.createLoanRequest(job.variables.token, data);

      job.complete({
        newloanrequest: { ...response },
      });
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      job.fail(err.message);
    }
  },
});
