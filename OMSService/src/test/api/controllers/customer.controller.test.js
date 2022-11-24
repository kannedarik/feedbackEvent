const _ = require('lodash');
const httpStatus = require('http-status');

const CustomerController = require('../../../api/controllers/customer.controller');
const Order = require('../../../api/models/order.model');
const RenewalOrder = require('../../../api/models/renewalorder.model');
const OrderBankAccount = require('../../../api/models/orderbankaccount.model');
const ZeebeService = require('../../../api/services/zeebe.service');
const MoneyRoutingService = require('../../../api/services/money_routing.service');
const { mockRequest, mockNext } = require('../../utils/interceptor');
const { smsType, accountVerification } = require('../../../api/utils/constants');

describe('Customer Controller', () => {
  beforeAll(() => {
    jest.spyOn(RenewalOrder, 'findOne')
      .mockReturnValue({
        customerId: 'mock-user',
      });
    jest.spyOn(OrderBankAccount, 'findOneAndUpdate')
      .mockReturnValue({});
    jest.spyOn(ZeebeService, 'publishMessage')
      .mockImplementation(jest.fn());
  });

  afterAll((done) => {
    jest.clearAllMocks();

    done();
  });
  const res = {
    status(code) {
      return {
        json(obj) {
          return _.merge(obj, { code });
        },
      };
    },
  };
  const next = mockNext();

  it('testing on list bank account api', (done) => {
    const req = mockRequest();

    jest.spyOn(MoneyRoutingService, 'listBankAccounts')
      .mockImplementation(() => ({}));
    CustomerController.listBankAccounts(req, res, next);
    expect(MoneyRoutingService.listBankAccounts).toBeCalled();
    done();
  });

  describe('testing initiate penny testing api', () => {
    const req = {
      body: {
        orderId: 'test_orderid',
        bankAccount: { accountNumber: 'test_bankAccount#123' },
      },
      user: { id: 'mock-user' },
    };

    jest.spyOn(MoneyRoutingService, 'initiatePennyTesting')
      .mockImplementation(() => ({
        data: {
          status: 'verification_failed',
          transactionId: 'test_transaction123',
        },
      }));
    jest.spyOn(OrderBankAccount, 'findOne')
      .mockReturnValue({
        accountNumber: 'test_bankAccount#456',
      });

    it('testing the no order found branch', async (done) => {
      jest.spyOn(Order, 'findOne')
        .mockImplementation(() => null);

      const responseObj = await CustomerController.initiatePennyTesting(req, res, next);
      expect(responseObj.code).toEqual(httpStatus.BAD_REQUEST);
      done();
    });

    it('testing the normal flow', async (done) => {
      jest.spyOn(Order, 'findOne')
        .mockImplementation((orderid) => ({
          _id: orderid,
          customerId: 'mock-user',
        }));

      const responseObj = await CustomerController.initiatePennyTesting(req, res, next);
      expect(responseObj.code).toEqual(httpStatus.OK);
      done();
    });
  });

  it('testing resend otp api', async (done) => {
    const req = {
      params: { transactionId: 'transactionId#123' },
      query: { type: smsType.SMS },
      user: {
        id: 'mock-user',
      },
    };

    jest.spyOn(OrderBankAccount, 'findOne')
      .mockReturnValue({
        accountNumber: 'test_bankAccount#456',
        orderId: 'test-orderId',
      });
    jest.spyOn(MoneyRoutingService, 'resendOTP')
      .mockReturnValue({});
    const responseObj = await CustomerController.resendOTP(req, res, next);
    expect(responseObj.code).toEqual(httpStatus.OK);
    done();
  });

  it('testing transaction status api', async (done) => {
    const req = {
      params: { transactionId: 'test_transactionId#123' },
      user: {
        id: 'mock-user',
      },
    };

    jest.spyOn(MoneyRoutingService, 'transactionStatus')
      .mockReturnValue({
        data: {
          status: 'verification_failed',
          updatedAt: '',
        },
      });

    jest.spyOn(OrderBankAccount, 'findOne')
      .mockReturnValue({ orderId: 'orderId#123', accountVerified: false });

    const responseObj = await CustomerController.transactionStatus(req, res, next);
    expect(responseObj.code).toEqual(httpStatus.OK);
    done();
  });

  it('testing verify OTP api', async (done) => {
    const req = {
      params: { transactionId: 'test_transactionId#123' },
      body: { otp: '1234' },
      user: {
        id: 'mock-user',
      },
    };

    jest.spyOn(MoneyRoutingService, 'verifyOTP')
      .mockReturnValue({
        data: {
          status: 'verification_failed',
          updatedAt: '',
        },
      });

    jest.spyOn(OrderBankAccount, 'findOne')
      .mockReturnValue({
        orderId: 'orderId#123',
        retryCount: 0,
      });

    jest.spyOn(RenewalOrder, 'findOne')
      .mockReturnValue({
        customerId: 'mock-user',
      });

    jest.spyOn(OrderBankAccount, 'findOneAndUpdate')
      .mockImplementation((orderId) => ({ orderId }));

    const responseObj = await CustomerController.verifyOTP(req, res, next);
    expect(responseObj.code).toEqual(httpStatus.OK);
    done();
  });
});
