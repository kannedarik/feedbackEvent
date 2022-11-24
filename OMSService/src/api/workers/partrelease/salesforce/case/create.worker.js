/* eslint-disable max-len */
const { v4: uuidv4 } = require('uuid');
const ErrorHandler = require('../../../../utils/error');
const NotificationService = require('../../../../services/notification.service');
const NotificationCache = require('../../../../utils/cache/notification');
const constants = require('../../../../utils/constants');

module.exports = () => ({
  taskType: 'partrelease.salesforce.case.create',
  taskHandler: async (job) => {
    try {
      const [category, provider, type] = await Promise.all([
        NotificationCache.getCategories(job.customHeaders.category),
        NotificationCache.getProviders(job.customHeaders.provider),
        NotificationCache.getTypes(job.customHeaders.type),
      ]);
      const payload = {
        category,
        type,
        provider,
        correlationid: uuidv4(),
        custom: {
          processType: job.variables.isJewelExport ? constants.caseCreationDetails.partReleaseProcessType : constants.caseCreationDetails.partPaymentProcessType,
          productCategory: constants.caseCreationDetails.productCategory,
          oldGL: constants.caseCreationDetails.oldGL,
          ...job.variables,
        },
      };
      await NotificationService.sendTicket(payload);
      return job.complete();
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      return job.fail();
    }
  },
});
