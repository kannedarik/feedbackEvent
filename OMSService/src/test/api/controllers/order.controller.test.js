const httpStatus = require('http-status');
const _ = require('lodash');

const Order = require('../../../api/models/order.model');
const OrderPayment = require('../../../api/models/orderpayment.model');
const OrderBankAccount = require('../../../api/models/orderbankaccount.model');
const OrderItem = require('../../../api/models/orderitem.model');
const OrderController = require('../../../api/controllers/order.controller');
// eslint-disable-next-line import/no-unresolved
const { mockRequest, mockNext } = require('../../utils/interceptor');
const {
  orderPayment,
  order,
  orderIdObjectArray,
} = require('../../data/controllers/order.controller.json');

describe('Order controller', () => {
  /**
   * Execute before all the test
   * Should be used for Mocking function etc
   */
  beforeEach(() => {
    /**
     * Mocking API to CORE service
     * @type {never}
     */

    const populateMocks = {
      OrderPaymentMock: {
        populate: () => orderPayment.data,
      },
      OrderMock: {
        populate: () => [order.data],
      },
    };

    jest.spyOn(OrderPayment, 'findOne')
      .mockReturnValue(populateMocks.OrderPaymentMock);
    jest.spyOn(Order, 'find')
      .mockReturnValue(populateMocks.OrderMock);
    jest.spyOn(Order, 'findOneAndUpdate')
      .mockReturnValue(populateMocks.OrderMock);
    jest.spyOn(OrderBankAccount, 'find')
      .mockReturnValue([{}]);
  });

  /**
   * Executes after all the test execution completes
   * Should be used for releasing all the Mock, Spies etc
   */
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

  /**
   * Test
   */
  describe('testing fetch order API', () => {
    const req = mockRequest();
    req.params.requestId = 1;

    it('should do sanity on the response of the fetch order API', async (done) => {
      const error = {};
      const responseObj = await OrderController.fetchOrderId(req, res, next);

      expect(responseObj.code).toBe(httpStatus.OK);
      expect(responseObj).toEqual(orderPayment.response);
      expect(error).toEqual({});
      done();
    });

    it('should return BAD REQUEST for already processed orders', async (done) => {
      jest.spyOn(OrderPayment, 'findOne')
        .mockReturnValue({
          populate() { return null; },
        });

      const responseObj = await OrderController.fetchOrderId(req, res, next);
      expect(responseObj.code).toEqual(httpStatus.BAD_REQUEST);
      done();
    });

    it('next should be called with an error when error occurs', async (done) => {
      await OrderController.fetchOrderId({}, res, next);
      expect(next).toBeCalled();
      done();
    });
  });

  describe('testing active API', () => {
    it('should do sanity on the response of active API lightweight', async (done) => {
      const req = {
        user: { id: '5e12f12a1e3ca6bb98f2b249', roles: ['customer'] },
        query: {},
      };

      const responseObj = await OrderController.active(req, res, next);
      expect(responseObj.code).toEqual(httpStatus.OK);
      expect(responseObj).toStrictEqual(order.response);
      done();
    });

    it('should do sanity on the response of active API lightweight with customerId', async (done) => {
      const req = {
        query: {
          customerId: '5e12f12a1e3ca6bb98f2b249',
        },
        user: { roles: ['support'] },
      };

      const responseObj = await OrderController.active(req, res, next);
      expect(responseObj.code).toEqual(httpStatus.OK);
      expect(responseObj).toStrictEqual(order.response);
      done();
    });

    it('error on active API without customerId and support role', async (done) => {
      const req = {
        user: { id: '5e12f12a1e3ca6bb98f2b249', roles: ['support'] },
      };
      await OrderController.active(req, res, next);
      expect(next).toBeCalled();
      done();
    });

    it('should do sanity on the response of active API not lightweight', async (done) => {
      const req = {
        user: { id: '5e12f12a1e3ca6bb98f2b249', roles: ['customer'] },
        query: {
          lightweight: false,
        },
      };

      const responseObj = await OrderController.active(req, res, next);
      expect(responseObj.code).toEqual(httpStatus.OK);
      expect(responseObj).toStrictEqual(order.heavyweightresponse);
      done();
    });

    it('should do sanity on the response of active API lightweight when LMS ids are passed', async (done) => {
      jest.spyOn(OrderItem, 'find')
        .mockReturnValue({
          select: () => orderIdObjectArray,
        });
      jest.spyOn(Order, 'find')
        .mockReturnValue({
          populate: () => ({ populate: () => [order.data] }),
        });
      const req = {
        user: { id: '5e12f12a1e3ca6bb98f2b249', roles: ['customer'] },
        query: {
          lightweight: false,
          loans: '181475027056510,152371444569328',
        },
      };

      const responseObj = await OrderController.active(req, res, next);
      expect(responseObj.code).toEqual(httpStatus.OK);
      expect(responseObj).toStrictEqual(order.heavyweightresponse);
      done();
    });

    it('next should be called with an error when error occurs', async (done) => {
      const req = {};
      await OrderController.active(req, res, next);
      expect(next).toBeCalled();
      done();
    });
  });

  describe('testing status API', () => {
    it('should do sanity on the response of status API', async (done) => {
      const req = {
        params: { id: 'testId#123' },
        body: { status: 'success' },
      };
      const responseObj = await OrderController.status(req, res, next);
      expect(responseObj.code).toEqual(httpStatus.OK);
      expect(responseObj).toStrictEqual({
        code: 200,
        message: 'Order status updated successfully',
      });
      done();
    });

    it('should return BAD RESPONSE on not finding any order', async (done) => {
      const req = {
        params: { id: 'testId#123' },
        body: { status: 'success' },
      };

      jest.spyOn(Order, 'findOneAndUpdate')
        .mockReturnValue(null);
      const responseObj = await OrderController.status(req, res, next);
      expect(responseObj.code).toEqual(httpStatus.BAD_REQUEST);
      expect(responseObj).toStrictEqual({
        code: 400,
        message: 'Resource not found or already processed',
      });
      done();
    });

    it('next should be called with an error when error occurs', async (done) => {
      const req = {};
      await OrderController.status(req, res, next);
      expect(next).toBeCalled();
      done();
    });
  });
});
