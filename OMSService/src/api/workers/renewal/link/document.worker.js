const { map } = require('lodash');
const Promise = require('bluebird');
const ErrorHandler = require('../../../utils/error');
const FirebaseUtil = require('../../../utils/firebase');

module.exports = () => ({
  taskType: 'link.document',
  taskHandler: async (job) => {
    try {
      const urls = [
        ...(job.variables.secureddocument ? [
          job.variables.secureddocument.url,
        ] : []),
        ...(job.variables.unsecureddocument ? [
          job.variables.unsecureddocument.url,
        ] : []),
        ...(job.variables.summarydocument && job.variables.summarydocument.url ? [
          job.variables.summarydocument.url,
        ] : []),
        ...(job.variables.summarydocument && job.variables.summarydocument.lesummaryurl ? [
          job.variables.summarydocument.lesummaryurl,
        ] : []),
        ...(job.variables.renewalLetter && job.variables.renewalLetter.url ? [
          job.variables.renewalLetter.url,
        ] : []),
      ];
      const response = await Promise.map(urls, (url) => FirebaseUtil.createLink(url));
      job.complete({ shortlinks: map(response, (link) => link.shortLink) });
    } catch (err) {
      ErrorHandler.captureWFError(job, err);
      job.fail(err.message);
    }
  },
});
