const _ = require('lodash');
const orderid = require('order-id');

const secretkey = 'test-secret-key';

const build = (options, renewaltype = '1:1') => _.merge({
  _id: 'test-orderid',
  orderId: orderid(secretkey).generate(),
  customerId: 'test-customerid',
  type: 'test-ordertype',
  status: 'created',
  signingstatus: 'success',
  paymentstatus: 'success',
  amount: 100,
  meta: {
    islocked: false, lockbankverification: false, tenureextension: false, renewaltype,
  },
  timestamps: {
    created: new Date(),
  },
  schemedata: { id: 'schemeid' },
}, options);

module.exports = { build };
