const _ = require('lodash');
const orderid = require('order-id');
const { Types: { ObjectId } } = require('mongoose');

const secretkey = 'test-secret-key';

const build = async (options) => _.merge({
  _id: 'test-orderid',
  orderId: orderid(secretkey).generate(),
  customerId: ObjectId(),
  type: 'test-ordertype',
  status: 'created',
  amount: 100,
  timestamps: {
    created: new Date(),
  },
}, options);

module.exports = { build };
