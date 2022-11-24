const _ = require('lodash');
const { logger } = require('../../../config/logger');

module.exports = () => ({
  taskType: 'zeebe.test',
  taskHandler: async (job) => {
    try {
      logger.info('inside zeebe.test', job.variables);
      return job.complete({ testing: 'done' });
    } catch (err) {
      logger.error('Error in zeebe.test', err);
      return job.fail(err.message);
    }
  },
});
