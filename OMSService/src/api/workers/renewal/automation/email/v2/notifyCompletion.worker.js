const _ = require('lodash');
const zeebeWorker = require('../../../../../utils/zeebeWorker');
const ZeebeService = require('../../../../../services/zeebe.service');

module.exports = zeebeWorker('renewal.automation.email.v2.notifyCompletion',
  async (job) => {
    const { branchID } = job.variables;
    const { automatedLenderEmailSent } = job.customHeaders;
    const orderIDs = _.get(job.variables, ['ordersPerBranchv2', branchID]);

    await Promise.all(orderIDs.map(async (orderID) => {
      await ZeebeService.publishMessage(orderID, 'automated_lender_email_notification', {
        automatedLenderEmailSent: automatedLenderEmailSent === 'true',
      });
    }));

    job.complete();
  });
