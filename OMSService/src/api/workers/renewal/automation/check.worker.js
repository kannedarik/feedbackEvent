const _ = require('lodash');
const zeebeWorker = require('../../../utils/zeebeWorker');
const RenewalOrder = require('../../../models/renewalorder.model');

const isTrue = (v) => v === true;

module.exports = zeebeWorker('renewal.automation.check',
  async (job) => {
    let order = await RenewalOrder.findOne({ _id: job.variables.orderid });

    const automationChecks = await order.checkForOrderAutomation(job.variables.token);

    if (_.every(automationChecks, isTrue)) {
      order = await RenewalOrder.findOneAndUpdate({ _id: job.variables.orderid },
        { automationState: 'automated' }, { new: true });
    }

    return job.complete({ automationState: order.automationState, automationChecks });
  });
