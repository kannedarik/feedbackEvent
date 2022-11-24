const SupportService = require('../../../../services/support.service');
const zeebeWorker = require('../../../../utils/zeebeWorker');

module.exports = zeebeWorker('renewal.automation.failure.updateSFTicket',
  async (job) => {
    await SupportService.updateSignStatus(job.variables.orderid, {
      Order_Automation_State: 'Automation Failed',
    });
    return job.complete();
  });
