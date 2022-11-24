const { Joi, Segments } = require('celebrate');
const _ = require('lodash');
const { differentialschemefileupload } = require('../../utils/constants');

module.exports = {
  bulkupload: {
    [Segments.BODY]: {
      identifier: Joi.string().required()
        .valid(..._.values(differentialschemefileupload.actionTypes)),
    },
  },
  // POST api/v1/differentialscheme/download
  filter: {
    [Segments.BODY]: Joi.object({
      GLId: Joi.string(),
      scheme: Joi.string(),
      uploadedBy: Joi.string(),
      createdAt: Joi.date(),
      updatedAt: Joi.date(),
      lastUploadedAt: Joi.date(),
    }),
  },
  // POST api/v1/differentialscheme/downloadSample
  template: {
    [Segments.QUERY]: {
      templateName: Joi.string().required().valid('activate', 'deactivate'),
    },
  },
  // GET api/v1/differentialscheme/scheme
  fetch: {
    [Segments.QUERY]: {
      selectedLoanIDs: Joi.string().allow('').required(),
      totalLoanIDs: Joi.string().allow('').required(),
      pendingLoanIDs: Joi.string().allow('').required(),
    },
  },
  // POST api/v1/differentialscheme/errorfile
  downloadErrorFile: {
    [Segments.QUERY]: {
      identifier: Joi.any().valid('differentialSchemeActivation', 'differentialSchemeDeactivation').required(),
      fileName: Joi.string().pattern(/\.csv/, { name: '.csv file format' }).required(),
      bucket: Joi.any().valid('differentialSchemeS3Bucket').required(),
      path: Joi.any().valid('differentialschemes').required(),
    },
  },
};
