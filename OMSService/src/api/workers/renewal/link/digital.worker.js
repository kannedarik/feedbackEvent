const FirebaseUtil = require('../../../utils/firebase');
const ErrorHandler = require('../../../utils/error');
const { services } = require('../../../../config/vars');

module.exports = () => ({
  taskType: 'link.digital',
  taskHandler: async (job) => {
    try {
      const url = `${services.portal.endpoint}${services.portal.otp}/${job.variables.customerorder}?redirected=success`;
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
