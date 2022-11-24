/* eslint-disable max-len */
const { v4: uuidv4 } = require('uuid');
const { filter, isEmpty, map } = require('lodash');
const { repledgeType } = require('../../../../utils/constants');
const NotificationService = require('../../../../services/notification.service');
const CoreCache = require('../../../../utils/cache/core');
const NotificationCache = require('../../../../utils/cache/notification');
const ErrorHandler = require('../../../../utils/error');

module.exports = () => ({
  taskType: 'renewal.cancel.notification.sms',
  taskHandler: async (job) => {
    try {
      const [category, provider, type, template, csphone] = await Promise.all([
        NotificationCache.getCategories(job.customHeaders.category),
        NotificationCache.getProviders(job.customHeaders.provider),
        NotificationCache.getTypes(job.customHeaders.type),
        NotificationCache.getTemplates(job.customHeaders.template),
        CoreCache.getCities(job.variables.customer.city.id, 'object', false, 'id', 'csphone'),
      ]);

      const renewalLoans = job.variables.loans && filter(
        job.variables.loans.payments,
        (oldloan) => oldloan.repledgetype !== repledgeType.LOAN_ENHANCEMENT,
      );
      const loanids = map(renewalLoans, (oldloan) => oldloan.losid);

      if (isEmpty(loanids)) {
        return job.complete();
      }

      const data = {
        customer: {
          id: job.variables.customer.id,
          phone: job.variables.phone,
        },
        category,
        type,
        provider,
        template: {
          id: template, // this should be a renewalCancellation SMS id
          data: {
            name: job.variables.customer.name,
            loanids: loanids && loanids.toString(),
            supportnumber: csphone,
          },
        },
        correlationid: uuidv4(),
      };
      await NotificationService.sendSMS(data);

      return job.complete();
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      return job.fail(err.message);
    }
  },
});
