const _ = require('lodash');

const build = (options) => _.merge({
  id: 'test-branch',
  branchname: 'indira nagar',
  address: 'DO.NO.1084, 12TH MAIN, HAL 2ND STAGE, INDIRA NAGAR, BANGALORE, KARNATAKA- 560008',
  locality: 'Indira Nagar',
  city: 'bangalore',
  location: { x: 12.97, y: 77.6384 },
  flags: { lenderintegration: false },
  emails: ['id@email.com'],
  pincode: '560008',
  branchof: 'test-branchOf',
  cityid: 1,
}, options);

module.exports = { build };
