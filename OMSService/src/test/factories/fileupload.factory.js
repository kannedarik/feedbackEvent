const _ = require('lodash');

const buildEdit = (options) => _.merge({
  GLId: 'GLId123',
  scheme: 'scheme123',
  uploadedBy: 'user',
  filename: 'test123',
  lastUploadedAt: new Date().toString(),
  totalrowcount: 1,
  processedrowcount: 0,
  errorrowcount: 0,
  receivedrowcount: 0,
  status: 'CREATED',
  errorfilelink: '',
  fileuploadidentifier: 'differentialSchemeActivation',
}, options);

const buildDelete = (options) => _.merge({
  GLId: 'GLId123',
  uploadedBy: 'user',
  filename: 'test123',
  lastUploadedAt: new Date(),
}, options);

module.exports = {
  buildEdit,
  buildDelete,
};
