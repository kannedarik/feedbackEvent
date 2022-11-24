const _ = require('lodash');

const build = (options) => _.merge({
  name: 'renewal',
}, options);

module.exports = { build };
