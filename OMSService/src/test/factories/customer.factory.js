const _ = require('lodash');

const build = (options) => _.merge({
  id: 'test-customerid',
  name: 'Customer Name',
  city: {
    id: 1,
    name: 'Bangalore',
  },
}, options);

module.exports = { build };
