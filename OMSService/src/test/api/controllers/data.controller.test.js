const _ = require('lodash');
const httpStatus = require('http-status');

const OrderItem = require('../../../api/models/orderitem.model');
const Order = require('../../../api/models/order.model');
const dataController = require('../../../api/controllers/data.controller');
const { mockNext, mockRequest, mockResponse } = require('../../utils/interceptor');
const {
  OrderItem: OrderItemFactory,
  Order: OrderFactory,
} = require('../../data/controllers/data.controller.json');

describe('data controller unit tests', () => {
  describe('sanity testing on the response returned by apis', () => {
    beforeAll(() => {
      jest.spyOn(OrderItem, 'find')
        .mockReturnValue({
          populate: () => OrderItemFactory.data,
        });
      jest.spyOn(Order, 'find')
        .mockReturnValue({
          populate: () => ({
            lean: () => OrderFactory.data,
          }),
        });
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    const res = {
      response: {},
      status(code) {
        this.response.code = code;
        return this;
      },
      json(respObj) {
        _.forEach(respObj, (value, key) => {
          this.response[key] = value;
        });
        return this.response;
      },
    };
    const next = mockNext();

    it('sanity testing on response of data API', async (done) => {
      const req = {
        body: { lmsids: ['test_LMSID#123'] },
      };
      const responseObj = await dataController.data(req, res, next);
      expect(responseObj.code).toBe(httpStatus.OK);
      expect(responseObj).toStrictEqual(OrderItemFactory.response);
      done();
    });

    it('sanity testing on response of bulk renewal data API', async (done) => {
      const req = {
        query: { date: '16-06-2020' },
      };
      const responseObj = await dataController.bulkRenewalData(req, res, next);
      expect(responseObj.code).toBe(httpStatus.OK);
      expect(responseObj).toStrictEqual(OrderFactory.response);
      done();
    });
  });

  describe('should call next in case of an error occured', () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    it('should call next with error in data api', async (done) => {
      await dataController.data(req, res, next);
      expect(next).toBeCalled();
      done();
    });

    it('should call next with error in bulk renewal data api', async (done) => {
      await dataController.bulkRenewalData(req, res, next);
      expect(next).toBeCalled();
      done();
    });
  });
});
