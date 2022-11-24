const { Types: { ObjectId } } = require('mongoose');

const mockRenewalObject = Object.freeze({
  _id: ObjectId().toString(),
  orderId: 'test-order-id',
  customerId: 'test-customer-id',
  status: 'created',
  amount: 100,
  timestamps: {
    created: new Date(),
  },
  schemedata: {},
  meta: {
    cancelledBy: 123,
  },
});

const mockRenewalUpdateObject = Object.freeze({
  _id: ObjectId().toString(),
  orderId: 'test-order-id',
  customerId: 'test-customer-id',
  status: 'created',
  amount: 100,
  timestamps: {
    created: new Date(),
  },
  schemedata: {},
  meta: {
    cancelledBy: 123,
  },
  cancellationReason: 'Others',
  cancellationComment: 'cancellation comment',
  cancellation_reason: 'Others',
});

const mockRenewalLockObject = Object.freeze({
  _id: ObjectId().toString(),
  orderId: 'test-order-id',
  customerId: 'test-customer-id',
  status: 'created',
  amount: 100,
  timestamps: {
    created: new Date(),
    pending: new Date(),

  },
  schemedata: {},
  meta: {
    islocked: true,
  },
  markModified() {
    return null;
  },
  save() {
    return null;
  },
});

module.exports = {
  mockRenewalObject,
  mockRenewalUpdateObject,
  mockRenewalLockObject,
};
