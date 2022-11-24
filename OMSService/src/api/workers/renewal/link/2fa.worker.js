const FirebaseUtil = require('../../../utils/firebase');
const ErrorHandler = require('../../../utils/error');
const { deepLinks } = require('../../../../config/vars');

module.exports = () => ({
  taskType: 'link.2fa',
  taskHandler: async (job) => {
    try {
      const url = `${deepLinks.endpoint}${deepLinks.pendingActionScreen}`;
      const response = await FirebaseUtil.createLink(url);
      job.complete({
        shortlinks: [response.shortLink],
        signingsms: false,
      });
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      job.fail(err.message);
    }
  },
});
