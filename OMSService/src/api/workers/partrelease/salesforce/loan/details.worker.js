/* eslint-disable max-len */
const _ = require('lodash');
const CoreService = require('../../../../services/core.service');
const PaymentService = require('../../../../services/payment.service');
const ErrorHandler = require('../../../../utils/error');

const getSecuredAndUnsecuredLoans = (loansArray, secureGL, unsecureGL) => ({
  secureLoan: _.find(loansArray, { loanid: secureGL }),
  unsecureLoan: _.find(loansArray, { loanid: unsecureGL }),
});

module.exports = () => ({
  taskType: 'partrelease.salesforce.loan.details',
  taskHandler: async (job) => {
    try {
      let paymentsLoanDetails = [];
      const { loanRequestData: response } = await CoreService.loanrequests({
        loanids: job.variables.loanId,
      });
      if (!job.variables.isJewelExport) {
        const { loans } = await PaymentService.fetchLoanPaymentData({
          loanids: [job.variables.secureGL, job.variables.unsecureGL].filter(Boolean).join(','),
        });
        paymentsLoanDetails = loans;
      }
      const { secureLoan, unsecureLoan } = !_.isEmpty(paymentsLoanDetails) ? getSecuredAndUnsecuredLoans(paymentsLoanDetails, job.variables.secureGL, job.variables.unsecureGL) : {};
      return job.complete({
        leadId: response.leadId,
        customerRupeekId: response.customerId,
        suppliedPhone: response.customerPhone,
        lenderId: response.lenderId,
        lenderName: response.lenderName,
        loanTransactionId: response.id,
        branchId: response.branchId,
        branchName: response.branchName,
        city: response.city,
        cityId: response.cityId,
        ...(response.pincode && {
          pincode: response.pincode,
        }),
        ...(response.referencenumber && {
          loanReferenceId: response.referencenumber,
        }),
        addressLatitude: response.addressLatitude,
        addressLongitude: response.addressLongitude,
        isCityLaunched: true,
        ...(secureLoan && {
          secureReleaseAmount: secureLoan.closingamount,
        }),
        ...(unsecureLoan && job.variables.unsecureLoanAmount && job.variables.unsecureGL && {
          unsecureReleaseAmount: unsecureLoan.closingamount,
        }),
      });
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      return job.fail();
    }
  },
});
