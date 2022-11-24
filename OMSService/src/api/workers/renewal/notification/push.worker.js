// const { chain, sumBy } = require('lodash');
// const { v4: uuidv4 } = require('uuid');
// const NotificationService = require('../../../services/notification.service');
// const NotificationCache = require('../../../utils/cache/notification');
// const ErrorHandler = require('../../../utils/error');
// const { telegram } = require('../../../utils/constants');

module.exports = () => ({
  taskType: 'renewal.notification.push',
  taskHandler: async (job) => {
    // try {
    //   const [category, provider, type, template] = await Promise.all([
    //     NotificationCache.getCategories(job.customHeaders.category),
    //     NotificationCache.getProviders(job.customHeaders.provider),
    //     NotificationCache.getTypes(job.customHeaders.type),
    //     NotificationCache.getTemplates(job.customHeaders.template),
    //   ]);

    //   const sloans = chain(job.variables.loans.payments)
    //     .filter({ loantype: 'secure' })
    //     .map((loan) => loan.losid)
    //     .value();
    //   const uloans = chain(job.variables.loans.payments)
    //     .filter({ loantype: 'unsecure' })
    //     .map((loan) => loan.losid)
    //     .value();
    //   const totalExcessFunding = sumBy(job.variables.loans.payments, 'excessamount');

    //   const data = {
    //     customer: {
    //       id: job.variables.customer.id,
    //       receiver: telegram[job.customHeaders.channel],
    //     },
    //     category,
    //     type,
    //     provider,
    //     template: {
    //       id: template,
    //       data: {
    //         name: job.variables.customer.name,
    //         phone: job.variables.phone,
    //         amount: job.variables.amount,
    //         type: job.variables.ordertype,
    //         sloans: sloans.join(', '),
    //         ...(uloans.length > 0 && { uloans: uloans.join(', ') }),
    //         ...(job.variables.pgresponseid && { transactionid: job.variables.pgresponseid.replace('_', '\\_') }),
    //         ...(totalExcessFunding > 0 && { reconrecovery: totalExcessFunding }),
    //       },
    //     },
    //     correlationid: uuidv4(),
    //   };
    //   await NotificationService.sendPush(data);

    //   job.complete();
    // } catch (err) {
    //   ErrorHandler.captureWFError(job, err);
    //   job.fail(err.message);
    // }
    job.complete();
  },
});
