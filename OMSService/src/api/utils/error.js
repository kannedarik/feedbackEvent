const { v4: uuidv4 } = require('uuid');
const NotificationService = require('../services/notification.service');
const NotificationCache = require('./cache/notification');
const { env, services } = require('../../config/vars');
const { slack } = require('./constants');
const { logger } = require('../../config/logger');

exports.captureWFError = async (job, error) => {
  try {
    const [category, provider, type, template] = await Promise.all([
      NotificationCache.getCategories('transactional'),
      NotificationCache.getProviders('slack'),
      NotificationCache.getTypes('push'),
      NotificationCache.getTemplates('WorkflowErrorMsg'),
    ]);

    const data = {
      customer: {
        ...(job.variables && job.variables.customer && {
          id: job.variables.customer.id,
        }),
        receiver: slack[env] || slack.default,
      },
      category,
      type,
      provider,
      template: {
        id: template,
        data: {
          baseurl: `${services.zeebe.uiendpoint}`,
          instance: job.workflowInstanceKey,
          process: job.bpmnProcessId,
          environment: env,
          worker: job.type,
          stack: error.stack,
        },
      },
      correlationid: uuidv4(),
    };
    await NotificationService.sendPush(data);
  } catch (err) {
    logger.error('Error in a worker when pushing a notification to Slack: ', err); // eslint-disable-line no-console
  }
};
