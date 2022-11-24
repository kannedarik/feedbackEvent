const _ = require('lodash');

const build = (options) => _.merge({
  orderId: 'test-orderid',
  status: 'success',
  retry: false,
  requestId: 'foobar',
}, options);

module.exports = { build };
