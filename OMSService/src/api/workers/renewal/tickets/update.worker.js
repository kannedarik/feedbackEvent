const moment = require('moment');
const SupportService = require('../../../services/support.service');
const ConfigWrapper = require('../../../../config/wrapper');
const zeebeWorker = require('../../../utils/zeebeWorker');

const salesforceOrderAutomationState = {
  automated: 'Automated',
  manual: 'Manual',
  automationCompleted: 'Automation Completed',
  automationFailed: 'Automation Failed',
};

module.exports = zeebeWorker('renewal.tickets.update', async (job) => {
  if (job.variables.ignoreticketupdate) {
    job.complete();
  }
  await SupportService.updateSignStatus(job.variables.orderid, {
    digital_sign_status: job.variables.locksign ? 'manual' : job.variables.signingstatus,
    digital_sign_type: job.variables.signingmethod,
    digital_sign_timestamp: moment().valueOf(),
    ...(ConfigWrapper.lookupBoolean('ENABLE_RENEWAL_AUTOMATION')
        && {
          Order_Automation_State:
            salesforceOrderAutomationState[job.variables.automationState],
        }),
  });

  job.complete();
});
