const ZeebeService = require('../services/zeebe.service');
const configWrapper = require('../../config/wrapper');

const DAILY_EMAIL_WORKFLOW_NAME = 'send-daily-email-to-lender';

module.exports = {
  name: 'DailyLenderEmailCron',
  frequency: configWrapper.lookupString('LENDER_EMAIL_CRON_FREQUENCY'),
  fn: async () => {
    if (!configWrapper.lookupBoolean('ENABLE_RENEWAL_AUTOMATION')) {
      return;
    }

    await ZeebeService.createWorkflowInstance(DAILY_EMAIL_WORKFLOW_NAME, {
      maxRetryCount: configWrapper.lookupInteger('RENEWAL_EMAIL_MAX_RETRY_COUNT'),
    });
  },
};
