const {
  capitalize, sumBy, find, isUndefined, has, filter,
} = require('lodash');
const { v4: uuidv4 } = require('uuid');
const NotificationService = require('../../../services/notification.service');
const NotificationCache = require('../../../utils/cache/notification');
const ErrorHandler = require('../../../utils/error');
const {
  email, loantypemapping, paymentType, repledgeType,
} = require('../../../utils/constants');

module.exports = () => ({
  taskType: 'renewal.notification.email',
  taskHandler: async (job) => {
    try {
      const [category, provider, type, template] = await Promise.all([
        NotificationCache.getCategories(job.customHeaders.category),
        NotificationCache.getProviders(job.customHeaders.provider),
        NotificationCache.getTypes(job.customHeaders.type),
        NotificationCache.getTemplates(job.customHeaders.template),
      ]);

      // eslint-disable-next-line max-len
      const paymentsLoans = filter(job.variables.loans.payments, ((paymentItem) => paymentItem.repledgetype !== repledgeType.LOAN_ENHANCEMENT));
      // eslint-disable-next-line max-len
      const repledgedLoans = filter(job.variables.loans.repledges, ((repledgedItem) => repledgedItem.repledgetype !== repledgeType.LOAN_ENHANCEMENT));

      const totalRebate = sumBy(paymentsLoans, 'rebate');
      const totalExcessFunding = sumBy(paymentsLoans, 'excessamount');
      const secureloan = find(paymentsLoans, { loantype: 'secure' });
      const renewaltype = (secureloan && secureloan.oldloantype) ? loantypemapping[secureloan.oldloantype] : job.variables.renewaltype; // eslint-disable-line max-len

      let subject = `${job.variables.customer.name} paid Rs. ${job.variables.amount} for ${paymentType[job.variables.ordertype]}`;
      if (totalRebate > 0 && totalExcessFunding > 0) {
        subject += ` with rebate Rs. ${totalRebate} and recovery amount Rs. ${totalExcessFunding}`;
      } else {
        if (totalRebate > 0) {
          subject += ` with rebate Rs. ${totalRebate}`;
        }
        if (totalExcessFunding > 0) {
          subject += ` with recovery amount Rs. ${totalExcessFunding}`;
        }
      }

      const data = {
        customer: {
          id: job.variables.customer.id,
          email: email.renewal[job.customHeaders.emaillist].email,
        },
        category,
        type,
        provider,
        template: {
          id: template,
          data: {
            name: job.variables.customer.name,
            phone: job.variables.phone,
            amount: job.variables.amount,
            action: job.variables.ordertype,
            type: renewaltype,
            vendor: capitalize(job.variables.paymentmethod),
            lender: capitalize(job.variables.securedlender),
            processingfeecharge: !!(job.variables.processingfeecharge || !isUndefined(find(paymentsLoans, (oldloan) => has(oldloan, 'olddisbursalamount')))),
            payments: paymentsLoans,
            repledges: repledgedLoans,
          },
        },
        options: {
          subject,
          cc: email.renewal[job.customHeaders.emaillist].cc,
        },
        correlationid: uuidv4(),
      };
      await NotificationService.sendEmail(data);

      job.complete();
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      job.fail(err.message);
    }
  },
});
