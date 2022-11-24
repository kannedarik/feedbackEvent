const ErrorHandler = require('./error');
const { logger } = require('../../config/logger');

const zeebeWorker = (taskType, taskHandler) => () => ({
  taskType,
  taskHandler: async (job) => {
    try {
      return await taskHandler(job);
    } catch (err) {
      logger.error(`Uncaught error in worker ${taskType}:`, err);
      ErrorHandler.captureWFError(job, err);
      return job.fail(err.message);
    }
  },
});

module.exports = zeebeWorker;
