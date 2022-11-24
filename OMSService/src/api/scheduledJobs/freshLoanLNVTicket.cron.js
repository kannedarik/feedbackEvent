const { map, isEmpty, includes } = require('lodash');
const NotificationService = require('../services/notification.service');
const CoreService = require('../services/core.service');
const { supportJwtToken } = require('../../config/vars');

/*
checks if the lploanid updated or not for given coreIds
*/
const isLpLoanidUpdated = (mappedLoans, coreIds) => {
  let isLploanidUpdated = true;
  map(mappedLoans, (mappedloan) => {
    map(mappedloan, (loangroup) => {
      map(loangroup.loans, ((loan) => {
        if (includes(coreIds, loan.loanid)) {
          isLploanidUpdated = isLploanidUpdated && (!isEmpty(loan.lploanid));
        }
      }));
    });
  });
  return isLploanidUpdated;
};

module.exports = {
  name: 'FreshLoanLNVTicket',
  fn: async (job) => {
    const { customer, custom } = job.attrs.data;
    const mappedLoans = await
    CoreService.supportMapLoansVersion5(customer.id, supportJwtToken, true);
    if (!isLpLoanidUpdated(mappedLoans, custom.coreIds)) {
      await NotificationService.sendTicket(job.attrs.data);
    }
  },
};
