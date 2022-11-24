const _ = require('lodash');

const SchemeFactory = require('./scheme.factory');

const build = (options, oldloantype = '1:1') => _.merge({
  _id: 'test-ordertype',
  orderId: 'test-orderid',
  meta: {
    losid: Math.floor(Math.random() * (10 ** 7)),
    lmsid: Math.floor(Math.random() * (10 ** 10)),
    newloandate: new Date(),
    newsecureamount: 100000,
    oldsecureamount: 90000,
    oldunsecureamount: 9000,
    newscheme: SchemeFactory.build(),
    branchid: 1,
    repledgetype: 'ENHANCE',
    oldloantype,
  },
}, options);

module.exports = { build };
