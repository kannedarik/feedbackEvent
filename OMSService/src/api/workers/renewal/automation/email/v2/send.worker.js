const _ = require('lodash');
const Promise = require('bluebird');
const UUID = require('uuid');
const OrderItem = require('../../../../../models/orderitem.model');
const zeebeWorker = require('../../../../../utils/zeebeWorker');
const LendingMDSService = require('../../../../../services/lendingMDS.service');
const NotificationService = require('../../../../../services/notification.service');
const NotificationCache = require('../../../../../utils/cache/notification');
const ConfigWrapper = require('../../../../../../config/wrapper');
const { logger } = require('../../../../../../config/logger');
const { services } = require('../../../../../../config/vars');
const { UpdateRenewalAutomationEmailDetails } = require('../../../../../utils/notification/email');

const cityAndBranchName = (branch) => `${branch.address.cityName} / ${branch.branchName}`;

const emailSubject = (branch) => `E-sign Renewal - ${cityAndBranchName(branch).toUpperCase()}`;

const markAsEmailProcessed = async (orderItems) => {
  // This is a safeguard to prevent emails for the same order item
  // being sent twice.
  // In production, this worker should only run once per day, so this
  // shouldn't be an issue. However, this is convenient for QA since
  // we can run the worker more frequently.
  await OrderItem.updateMany({ _id: orderItems.map((oi) => oi._id) },
    { 'meta.automatedEmailToLenderProcessed': true });
};

module.exports = zeebeWorker('renewal.automation.email.v2.send',
  async (job) => {
    const { branchID, ordersPerBranchv2 } = job.variables;
    const branch = await LendingMDSService.getBranchByCoreID(branchID);

    if (_.isEmpty(branch)) {
      throw new Error(`Couldn't find branch information for branch id: ${branchID}`);
    }

    const [category, provider, type, template] = await Promise.all([
      NotificationCache.getCategories(job.customHeaders.category),
      NotificationCache.getProviders(job.customHeaders.provider),
      NotificationCache.getTypes(job.customHeaders.type),
      NotificationCache.getTemplates(job.customHeaders.template),
    ]);
    const searchOrderItemsQuery = {
      'meta.branchid': branchID,
      orderId: _.get(ordersPerBranchv2, branchID),
    };
    const orderItems = await OrderItem.find(searchOrderItemsQuery);

    if (_.isEmpty(orderItems)) {
      logger.info(`no active automated orders for this branchid::${branchID}`);
      return job.complete();
    }
    let notificationId = null;
    try {
      const emailInformation = {
        correlationid: UUID.v4(),
        category,
        provider,
        type,
        customer: {
          email: branch.contactMails.join(','), // this is the 'to' field.
        },
        options: {
          subject: emailSubject(branch),
          cc: ConfigWrapper.lookupArray('FED_RENEWAL_EMAIL_CC_LIST') || [],
        },
        template: {
          id: template,
          data: {
            odAccountNumber: ConfigWrapper.lookupString('FED_OD_ACCOUNT_NUMBER'),
            orderItemDetails: orderItems.map((orderItem) => ({
              customerName: orderItem.meta.oldMISRecordDetails.lenderCustomerName,
              contactNumber: orderItem.meta.oldMISRecordDetails.lenderPrimaryPhone,
              newLoanID: orderItem.meta.losid,
              branchName: cityAndBranchName(branch),
              loanAccountNumber: orderItem.meta.lmsid,
              rebookAmount: orderItem.meta.newsecureamount,
              newScheme: _.get(_.find(orderItem.meta.newscheme.baseSchemes, { type: 'secure' }), 'legalName', ''),
            })),
          },
        },
      };
      const { data: emailResponse } = await NotificationService.sendEmail(emailInformation);
      notificationId = emailResponse.notification;
      await markAsEmailProcessed(orderItems);
      await UpdateRenewalAutomationEmailDetails(searchOrderItemsQuery, {
        id: notificationId,
        status: services.notification.status.pending,
        retryleft: ConfigWrapper.lookupInteger('RENEWAL_EMAIL_MAX_RETRY_COUNT'),
      });
      return job.complete();
    } catch (err) {
      logger.error('Error in worker renewal.automation.email.send:', err);
      // We shouldn't resend the email since this order will now be processed manually.
      await markAsEmailProcessed(orderItems);
      await UpdateRenewalAutomationEmailDetails(searchOrderItemsQuery, {
        status: services.notification.status.failure,
        id: notificationId,
        retryleft: 0,
      });
      return job.error('email_sending_failure', err.message);
    }
  });
