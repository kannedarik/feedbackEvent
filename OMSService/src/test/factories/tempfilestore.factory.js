const _ = require('lodash');

exports.build = (options) => _.merge({
  GLId: 'GLId123',
  scheme: 'scheme123',
  filename: 'testfile123',
  status: 'SUCCESS',
}, options);
