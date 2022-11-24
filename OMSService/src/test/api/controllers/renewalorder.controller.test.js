jest.mock('zeebe-node');

const mockUserID = 123;

jest.mock('../../../api/middlewares/auth', () => ({
  authorize: () => async (req, res, next) => {
    req.user = { id: mockUserID };
    return next();
  },
  authorizeKey: () => async (req, res, next) => {
    req.user = { id: mockUserID };
    return next();
  },
}));

const supertest = require('supertest');
const _ = require('lodash');
const httpStatus = require('http-status');
const app = require('../../../config/express');

const RenewalOrder = require('../../../api/models/renewalorder.model');
const OrderType = require('../../../api/models/ordertype.model');
const renewalControllerTestData = require('../testdata/renewalorder.testdata');
const RenewalController = require('../../../api/controllers/renewalorder.controller');
const OrderDocSigning = require('../../../api/models/orderdocsigning.model');
const OrderBankAccount = require('../../../api/models/orderbankaccount.model');
const ZeebeService = require('../../../api/services/zeebe.service');
const RenewalOrderFactory = require('../../factories/renewalorder.factory');
const OrderPaymentFactory = require('../../factories/orderpayment.factory');
const OrderItemFactory = require('../../factories/orderitem.factory');

// eslint-disable-next-line import/no-unresolved
const { mockRequest, mockNext } = require('../../utils/interceptor');
const {
  sendSigningSMS, listPaymentMethods, cancel, ListSigningMethod,
  updateSigningMethod, createRenewalOrder, readRenewalOrder,
} = require('../../data/controllers/renewalorder.controller.json');

describe('Renewal Order Cancellation', () => {
  it('should throw validation error when cancellation reason is not provided', async () => {
    const response = await supertest(app)
      .post('/api/v1/orders/renewals/cancellation/initiate')
      .send({ orderId: 'RANDOM_ORDER' });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBe('"cancellationReason" is required');
  });

  it('should throw validation error when cancellation reason is not the one it is expecting', async () => {
    const response = await supertest(app)
      .post('/api/v1/orders/renewals/cancellation/initiate')
      .send({ orderId: 'RANDOM_ORDER', cancellationReason: 'RANDOM_REASON' });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBe('"cancellationReason" must be one of [Need Release/ Part Release, Customer changed their mind, Others]');
  });

  it('should throw validation error when reason is Others but comment is not provided', async () => {
    const response = await supertest(app)
      .post('/api/v1/orders/renewals/cancellation/initiate')
      .send({ orderId: 'RANDOM_ORDER', cancellationReason: 'Others' });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBe('"cancellationComment" is required');
  });

  it('should throw validation error when reason is Others but comment is empty', async () => {
    const response = await supertest(app)
      .post('/api/v1/orders/renewals/cancellation/initiate')
      .send({ orderId: 'RANDOM_ORDER', cancellationReason: 'Others', cancellationComment: '' });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBe('"cancellationComment" is not allowed to be empty');
  });

  it('should add cancellationReason, cancellationComment, and cancelledBy to the order', async () => {
    jest.spyOn(RenewalOrder, 'findOneAndUpdate').mockResolvedValue(renewalControllerTestData.mockRenewalObject);
    jest.spyOn(RenewalOrder, 'update').mockResolvedValue(renewalControllerTestData.mockRenewalUpdateObject);

    const request = {
      orderId: renewalControllerTestData.mockRenewalObject.orderId,
      cancellationReason: 'Others',
      cancellationComment: 'cancellation comment',
    };

    const response = await supertest(app)
      .post('/api/v1/orders/renewals/cancellation/initiate')
      .send(request);

    expect(response.status).toEqual(200);
    expect(renewalControllerTestData.mockRenewalUpdateObject.cancellationReason).toEqual(
      request.cancellationReason,
    );
    expect(renewalControllerTestData.mockRenewalUpdateObject.cancellationComment).toEqual(
      request.cancellationComment,
    );
    expect(renewalControllerTestData.mockRenewalUpdateObject.meta.cancelledBy).toEqual(mockUserID);
  });

  it('should return 400 in case of not order found', async () => {
    jest.spyOn(RenewalOrder, 'findOneAndUpdate').mockResolvedValue(null);
    const request = {
      orderId: renewalControllerTestData.mockRenewalObject.orderId,
      cancellationReason: 'Others',
      cancellationComment: 'cancellation comment',
    };

    const response = await supertest(app)
      .post('/api/v1/orders/renewals/cancellation/initiate')
      .send(request);

    expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    expect(response.body.message).toBe('Resource not found or already processed');
  });
});
describe('Renewal controller', () => {
  /**
   * Execute before all the test
   * Should be used for Mocking function etc
   */
  beforeAll(() => {
    /**
     * Mocking API to CORE service
     * @type {never}
     */

    const mock = jest.spyOn(RenewalOrder, 'cancelOrder');
    mock.mockReturnValue({});
  });

  /**
   * Executes after all the test execution completes
   * Should be used for releasing all the Mock, Spies etc
   */
  afterAll((done) => {
    jest.clearAllMocks();

    done();
  });

  /**
   * Test
   */
  it('should do sanity on the response of the cancel', async (done) => {
    const req = mockRequest();
    req.params.processId = cancel.data.processId;

    let resStatus;
    const res = {
      send() {
      },
      status(responseStatus) {
        resStatus = responseStatus;
        // This next line makes it chainable
        return this;
      },
    };
    const error = {};

    await RenewalController.cancel(req, res, mockNext);

    expect(resStatus)
      .toBe(httpStatus.NO_CONTENT);
    expect(error)
      .toEqual({});
    done();
  });
});

describe('Renewal controller', () => {
  /**
   * Execute before all the test
   * Should be used for Mocking function etc
   */
  beforeAll(() => {
    /**
     * Mocking API to CORE service
     * @type {never}
     */

    const populateMocks = {
      populate: () => ListSigningMethod.data.order,
    };
    const mock1 = jest.spyOn(RenewalOrder, 'findOne');
    mock1.mockImplementation(() => populateMocks);
    const mock2 = jest.spyOn(RenewalOrder, 'listSigningMethods');
    mock2.mockReturnValue(ListSigningMethod.data.signingtypes);
  });

  /**
   * Executes after all the test execution completes
   * Should be used for releasing all the Mock, Spies etc
   */
  afterAll((done) => {
    jest.clearAllMocks();

    done();
  });

  /**
   * Test
   */
  it('should do sanity on the response of the listSigningMethods', async (done) => {
    const req = mockRequest();
    req.params.orderId = ListSigningMethod.data.orderId;
    req.user = ListSigningMethod.data.user;

    let resStatus;
    let resp;
    const res = {
      send() {
      },
      json(response) {
        resp = response;
      },
      status(responseStatus) {
        resStatus = responseStatus;
        // This next line makes it chainable
        return this;
      },
    };
    const error = {};

    await RenewalController.listSigningMethods(req, res, mockNext);

    expect(resStatus)
      .toBe(httpStatus.OK);
    expect(resp)
      .toEqual(ListSigningMethod.response);
    expect(error)
      .toEqual({});
    done();
  });

  it('should return 400 in case no orders were found', async (done) => {
    jest.spyOn(RenewalOrder, 'findOne').mockReturnValue({
      populate() { return null; },
    });
    const req = mockRequest();
    req.params.orderId = ListSigningMethod.data.orderId;
    req.user = ListSigningMethod.data.user;

    let resStatus;
    let resp;
    const res = {
      send() {
      },
      json(response) {
        resp = response;
      },
      status(responseStatus) {
        resStatus = responseStatus;
        // This next line makes it chainable
        return this;
      },
    };

    await RenewalController.listSigningMethods(req, res, mockNext);
    expect(resStatus).toEqual(httpStatus.BAD_REQUEST);
    expect(resp).toStrictEqual({
      code: httpStatus.BAD_REQUEST,
      message: 'Resource not found or already processed',
    });
    done();
  });
});

describe('Renewal controller', () => {
  /**
   * Execute before all the test
   * Should be used for Mocking function etc
   */
  beforeAll(() => {
    /**
     * Mocking API to CORE service
     * @type {never}
     */

    jest.spyOn(RenewalOrder, 'findOne')
      .mockResolvedValue(sendSigningSMS.data.order);
    jest.spyOn(ZeebeService, 'publishMessage')
      .mockResolvedValue({});
    jest.spyOn(OrderDocSigning, 'updateMany')
      .mockResolvedValue({});
  });

  /**
   * Executes after all the test execution completes
   * Should be used for releasing all the Mock, Spies etc
   */
  afterAll((done) => {
    jest.clearAllMocks();

    done();
  });
});

describe('Renewal controller', () => {
  /**
   * Execute before all the test
   * Should be used for Mocking function etc
   */
  beforeAll(() => {
    /**
     * Mocking API to CORE service
     * @type {never}
     */

    const populateMocks = {
      populate: () => listPaymentMethods.data.order,
    };

    const mock1 = jest.spyOn(RenewalOrder, 'findOne');
    mock1.mockImplementation(() => populateMocks);
    const mock2 = jest.spyOn(RenewalOrder, 'listPaymentMethods');
    mock2.mockReturnValue(listPaymentMethods.data.response);
  });

  /**
   * Executes after all the test execution completes
   * Should be used for releasing all the Mock, Spies etc
   */
  afterAll((done) => {
    jest.clearAllMocks();

    done();
  });

  /**
   * Test
   */
  it('should do sanity on the response of the listPaymentMethods', async (done) => {
    const req = mockRequest();
    req.params.orderId = listPaymentMethods.data.orderId;
    req.user = listPaymentMethods.data.user;

    let resStatus;
    let resp;
    const res = {
      send() {
      },
      json(response) {
        resp = response;
      },
      status(responseStatus) {
        resStatus = responseStatus;
        // This next line makes it chainable
        return this;
      },
    };
    const error = {};

    await RenewalController.listPaymentMethods(req, res, mockNext);

    expect(resStatus)
      .toBe(httpStatus.OK);
    expect(resp)
      .toEqual(listPaymentMethods.response[0]);
    expect(error)
      .toEqual({});
    done();
  });

  it('should do sanity on the response of the listPaymentMethods includes order', async (done) => {
    const req = mockRequest();
    req.params.orderId = listPaymentMethods.data.orderId;
    req.user = listPaymentMethods.data.user;
    req.query.includes = 'order';

    let resStatus;
    let resp;
    const res = {
      send() {
      },
      json(response) {
        resp = response;
      },
      status(responseStatus) {
        resStatus = responseStatus;
        // This next line makes it chainable
        return this;
      },
    };
    const error = {};

    await RenewalController.listPaymentMethods(req, res, mockNext);

    expect(resStatus)
      .toBe(httpStatus.OK);
    expect(resp)
      .toEqual(listPaymentMethods.response[1]);
    expect(error)
      .toEqual({});
    done();
  });

  it('should return 400 in case of not order found', async () => {
    jest.spyOn(RenewalOrder, 'findOne').mockReturnValue({
      populate: () => null,
    });
    const request = {
      params: { orderId: listPaymentMethods.data.orderId },
      user: listPaymentMethods.data.user,
    };

    const response = await supertest(app)
      .get(`/api/v1/orders/renewals/${listPaymentMethods.data.orderId}/paymentmethods`)
      .send(request);

    expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    expect(response.body.message).toBe('Resource not found or already processed');
  });
});

describe('Renewal controller', () => {
  /**
   * Execute before all the test
   * Should be used for Mocking function etc
   */
  beforeAll(() => {
    /**
     * Mocking API to CORE service
     * @type {never}
     */

    const mock1 = jest.spyOn(RenewalOrder, 'findOneAndUpdate');
    mock1.mockReturnValue(updateSigningMethod.data.order);
    const mock2 = jest.spyOn(RenewalOrder, 'updateSigningMethod');
    mock2.mockReturnValue({});
  });

  /**
   * Executes after all the test execution completes
   * Should be used for releasing all the Mock, Spies etc
   */
  afterAll((done) => {
    jest.clearAllMocks();

    done();
  });

  /**
   * Test
   */
  it('should do sanity on the response of the updateSigningMethod', async (done) => {
    const req = mockRequest();
    req.params.orderId = updateSigningMethod.data.orderId;
    req.user = updateSigningMethod.data.user;
    req.body = updateSigningMethod.data.body;

    let resStatus;
    let resp;
    const res = {
      send() {
      },
      json(response) {
        resp = response;
      },
      status(responseStatus) {
        resStatus = responseStatus;
        // This next line makes it chainable
        return this;
      },
    };
    const error = {};

    await RenewalController.updateSigningMethod(req, res, mockNext);

    expect(resStatus)
      .toBe(httpStatus.OK);
    expect(resp)
      .toEqual(updateSigningMethod.response);
    expect(error)
      .toEqual({});
    done();
  });

  it('should return 400 in case of not order found', async () => {
    jest.spyOn(RenewalOrder, 'findOneAndUpdate').mockReturnValue({
      populate: () => null,
    });
    const req = mockRequest();
    req.params.orderId = updateSigningMethod.data.orderId;
    req.user = updateSigningMethod.data.user;
    req.body = updateSigningMethod.data.body;

    const response = await supertest(app)
      .get(`/api/v1/orders/renewals/${updateSigningMethod.data.orderId}/signingmethods`)
      .send(req);

    expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    expect(response.body.message).toBe('Resource not found or already processed');
  });
});

describe('Renewal controller - Create Order', () => {
  /**
   * Execute before all the test
   * Should be used for Mocking function etc
   */
  beforeAll(() => {
    /**
     * Mocking API to CORE service
     * @type {never}
     */

    const mock1 = jest.spyOn(OrderType, 'findOne');
    mock1.mockReturnValue(createRenewalOrder.data.type);
    const mock2 = jest.spyOn(RenewalOrder, 'createOrder');
    mock2.mockReturnValue(createRenewalOrder.data);
  });

  /**
   * Executes after all the test execution completes
   * Should be used for releasing all the Mock, Spies etc
   */
  afterAll((done) => {
    jest.clearAllMocks();

    done();
  });

  /**
   * Test
   */
  it('should do sanity on the response of the create RenewalOrder', async (done) => {
    const req = createRenewalOrder.body;
    const response = await supertest(app)
      .post('/api/v1/orders/renewals')
      .send(req);

    const { body } = response;

    expect(response.statusCode)
      .toBe(httpStatus.CREATED);
    expect(body)
      .toStrictEqual(createRenewalOrder.response);
    done();
  });
});

describe('Renewal controller - Active Order', () => {
  /**
   * Execute before all the test
   * Should be used for Mocking function etc
   */
  beforeAll(() => {
    /**
     * Mocking API to CORE service
     * @type {never}
     */

    const mock2 = jest.spyOn(OrderBankAccount, 'find');
    mock2.mockReturnValue(null);
  });

  /**
   * Executes after all the test execution completes
   * Should be used for releasing all the Mock, Spies etc
   */
  afterAll((done) => {
    jest.clearAllMocks();

    done();
  });

  /**
   * Test
   */
  it('should do sanity on the response of the active orders for 1:1', async (done) => {
    const mock1 = jest.spyOn(RenewalOrder, 'find');
    const orderPayment1 = OrderPaymentFactory.build({ _id: 'test-ordertype', orderId: 'test-id1' });
    const orderItem1 = OrderItemFactory.build({ _id: 'test-orderitem1', orderId: 'test-id1' });
    const order1 = RenewalOrderFactory.build({
      _id: 'test-id1', status: 'pending', payments: [orderPayment1], items: [orderItem1],
    });

    mock1.mockImplementationOnce(() => ({
      populate: () => [order1],
    }));
    const req = mockRequest();
    req.query.customer = 'test-customerid';
    let resStatus;
    let resp;
    const res = {
      send() {
      },
      json(response) {
        resp = response;
      },
      status(responseStatus) {
        resStatus = responseStatus;
        // This next line makes it chainable
        return this;
      },
    };

    await RenewalController.active(req, res, mockNext);
    expect(resStatus)
      .toBe(httpStatus.OK);
    expect(resp.orders[0].request)
      .toStrictEqual(order1.orderId);

    done();
  });

  it('should do sanity on the response of the active orders for N:1', async (done) => {
    const mock1 = jest.spyOn(RenewalOrder, 'find');
    const orderPayment1 = OrderPaymentFactory.build({ _id: 'test-ordertype', orderId: 'test-id1' });
    const orderItem1 = OrderItemFactory.build({ _id: 'test-orderitem1', orderId: 'test-id1' }, 'N:1');
    const order1 = RenewalOrderFactory.build({
      _id: 'test-id1', status: 'pending', payments: [orderPayment1], items: [orderItem1],
    }, 'N:1');

    mock1.mockImplementationOnce(() => ({
      populate: () => [order1],
    }));
    const req = mockRequest();
    req.query.customer = 'test-customerid';
    let resStatus;
    let resp;
    const res = {
      send() {
      },
      json(response) {
        resp = response;
      },
      status(responseStatus) {
        resStatus = responseStatus;
        // This next line makes it chainable
        return this;
      },
    };

    await RenewalController.active(req, res, mockNext);
    expect(resStatus)
      .toBe(httpStatus.OK);
    expect(resp.orders[0].request)
      .toStrictEqual(order1.orderId);

    done();
  });
});
describe('Renewal controller - Read Order', () => {
  beforeAll(() => {
    const mock1 = jest.spyOn(OrderBankAccount, 'findOne');
    mock1.mockReturnValue(null);
    const mock2 = jest.spyOn(RenewalOrder, 'findOne');
    mock2.mockReturnValue({
      populate: () => ({
        ...readRenewalOrder.data,
        toJSON: () => _.pick(readRenewalOrder.data, [
          'orderId', 'customerId', 'type', 'status', 'amount', 'signingmethod', 'paymentmethod',
          'signingstatus', 'paymentstatus', 'loanstatus', 'payment', 'poll', 'locksign', 'hasLoanEnhancementLoans', 'processId',
        ]),
      }),
    });
  });

  it('should do sanity on the response of the read RenewalOrder', async (done) => {
    const req = readRenewalOrder.body;
    const response = await supertest(app)
      .get(`/api/v1/orders/renewals/${readRenewalOrder.data.orderId}`)
      .send(req);

    const { body } = response;

    expect(response.statusCode)
      .toBe(httpStatus.OK);
    expect(body)
      .toStrictEqual(readRenewalOrder.response);
    done();
  });
});
