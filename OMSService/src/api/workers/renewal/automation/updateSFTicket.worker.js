const SupportService = require('../../../services/support.service');
const zeebeWorker = require('../../../utils/zeebeWorker');
const OrderItems = require('../../../models/orderitem.model');

const salesforceOrderAutomationState = {
  automated: 'Automated',
  manual: 'Manual',
  automation_completed: 'Automation Completed',
  automation_failed: 'Automation Failed',
  lender_portal_updated: 'Lender Portal Update',
  lender_email_sent: 'Lender Email Sent',
};
const markLenderPortalSFUpdate = async (orderId) => {
  // to prevent send email if push to lenderportal not updated in SF
  await OrderItems.updateMany(
    { orderId },
    { 'meta.isEligibleForSendEmail': true },
  );
};

module.exports = zeebeWorker('renewal.automation.updateSFTicket',
  async (job) => {
    await SupportService.updateSignStatus(job.variables.orderid, {
      Order_Automation_State: salesforceOrderAutomationState[job.customHeaders.updateKey],
    });
    if (job.customHeaders.updateKey === 'lender_portal_updated') {
      await markLenderPortalSFUpdate(job.variables.orderid);
    }
    return job.complete();
  });
