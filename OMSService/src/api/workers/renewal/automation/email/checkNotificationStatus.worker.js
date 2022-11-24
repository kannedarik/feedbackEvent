const zeebeWorker = require('../../../../utils/zeebeWorker');
const NotificationService = require('../../../../services/notification.service');
const { services } = require('../../../../../config/vars');
const { logger } = require('../../../../../config/logger');
const configWrapper = require('../../../../../config/wrapper');

module.exports = zeebeWorker('renewal.automation.email.checkNotificationStatus',
  async (job) => {
    try {
      // no need to check notification status if notificationId undefined
      // it means we have no order for which email was   sent
      if (!job.variables.notificationId) {
        return job.complete({
          retryCount: configWrapper.lookupInteger('RENEWAL_EMAIL_MAX_RETRY_COUNT'),
          emailNotificationSucceeded: false,
        });
      }
      const { notification: emailNotificationDetails } = await NotificationService
        .notificationDetails(job.variables.notificationId);
      if (emailNotificationDetails.status.name === services.notification.status.success) {
        return job.complete({
          retryCount: job.variables.retryCount + 1,
          emailNotificationSucceeded: true,
        });
      }
      return job.complete({
        retryCount: job.variables.retryCount + 1,
        emailNotificationSucceeded: false,
      });
    } catch (err) {
      logger.error('Error in worker renewal.automation.email.checkNotificationStatus', err);
      return job.complete({
        retryCount: job.variables.retryCount + 1,
        emailNotificationSucceeded: false,
      });
    }
  });
