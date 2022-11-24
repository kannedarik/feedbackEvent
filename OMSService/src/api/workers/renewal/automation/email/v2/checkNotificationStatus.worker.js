const _ = require('lodash');

const zeebeWorker = require('../../../../../utils/zeebeWorker');
const NotificationService = require('../../../../../services/notification.service');
const { services } = require('../../../../../../config/vars');
const { UpdateRenewalAutomationEmailDetails } = require('../../../../../utils/notification/email');
const { logger } = require('../../../../../../config/logger');
const OrderItem = require('../../../../../models/orderitem.model');

module.exports = zeebeWorker('renewal.automation.email.v2.checkNotificationStatus',
  async (job) => {
    const { branchID, ordersPerBranchv2 } = job.variables;

    const orderitemSearchCriteria = {
      'meta.branchid': branchID,
      orderId: _.get(ordersPerBranchv2, branchID),
    };
    try {
      const orderItems = await OrderItem.find(orderitemSearchCriteria);
      if (_.isEmpty(orderItems)) {
        logger.error(`No order(s) with branch id ${branchID} were found`);
        return job.error('email_sending_failure', `No order(s) with branch id ${branchID} were not found`);
      }
      const { notification, retryleft } = orderItems[0].meta.automatedEmailDetails;

      // no need to check notification status if notificationId undefined
      // it means we have no order for which email was sent
      if (_.isEmpty(notification)) {
        return job.error('email_sending_failure');
      }
      // if retry limit has exhausted, throw error
      if (retryleft <= 0) {
        logger.error('Retry limit exceed for sending this email');
        await UpdateRenewalAutomationEmailDetails(orderitemSearchCriteria, {
          id: notification.id,
          status: services.notification.status.failure,
          retryleft: 0,
        });
        return job.error('email_sending_failure', 'Retry limit exceed for sending this email');
      }

      const { notification: emailNotificationDetails } = await NotificationService
        .notificationDetails(orderItems[0].meta.automatedEmailDetails.notification.id);

      await UpdateRenewalAutomationEmailDetails(orderitemSearchCriteria, {
        id: orderItems[0].meta.automatedEmailDetails.notification.id,
        status: emailNotificationDetails.status.name,
        retryleft: orderItems[0].meta.automatedEmailDetails.retryleft - 1,
      });

      if (emailNotificationDetails.status.name === services.notification.status.success) {
        return job.complete();
      }
      return job.error('email_retry_event');
    } catch (err) {
      logger.error('Error in worker renewal.automation.email.checkNotificationStatus', err);
      await UpdateRenewalAutomationEmailDetails(
        orderitemSearchCriteria, { decreaseRetryCount: true },
      );
      return job.error('email_retry_event');
    }
  });
