const { isEqual, forEach } = require('lodash');
const { v4: uuidv4 } = require('uuid');
const NotificationService = require('../services/notification.service');
const CoreService = require('../services/core.service');
const { supportJwtToken } = require('../../config/vars');
const { logger } = require('../../config/logger');

/*
checks for the given order Id, the loanId is empty or exists
*/
const loanIdIsEmptyinCore = (mappedLoans, orderId) => {
  let isLoanidEmpty = false;
  forEach(mappedLoans, (mappedloan) => {
    forEach(mappedloan, (group) => {
      forEach(group.loans, ((loan) => {
        if (!loan.lploanid && isEqual(loan.orderId, orderId)) {
          isLoanidEmpty = true;
        }
      }));
    });
  });
  return isLoanidEmpty;
};

module.exports = {
  name: 'LoanNotVisibleTicketCreation',
  fn: async (job) => {
    const {
      orderId,
      category,
      provider,
      type,
      customer,
      lenderDetails,
      city,
      loanIds,
    } = job.attrs.data;
    const mappedLoans = await CoreService.supportMapLoansVersion5(customer.id,
      supportJwtToken, true, true, true);
    if (loanIdIsEmptyinCore(mappedLoans, orderId)) {
      const data = {
        customer:
        {
          id: customer.id,
          phone: customer.phone,
        },
        category,
        type,
        provider,
        correlationid: uuidv4(),
        custom: {
          processType: 'loanNotVisible',
          type: 'renewal',
          customerId: customer.id,
          customerPhone: customer.phone,
          customerName: customer.name,
          description: 'Loan Not Visible | Renewal',
          priority: 'high',
          lenderName: lenderDetails.lenderName,
          lenderBranch: lenderDetails.lenderBranch,
          loanIds,
          city,

        },
      };
      logger.info('calling ticket creation api with options:', data);
      await NotificationService.sendTicket(data);
    }
  },
};
