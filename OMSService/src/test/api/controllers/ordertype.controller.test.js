const _ = require('lodash');

const httpStatus = require('http-status');
const OrderType = require('../../../api/models/ordertype.model');
const OrderTypeController = require('../../../api/controllers/ordertype.controller');
const { mockRequest, mockNext, mockResponse } = require('../../utils/interceptor');
const {
  createOrderType, listOrderType, readOrderType, updateOrderType,
} = require('../../data/controllers/ordertype.controller.json');

describe('createOrderType controller', () => {
  beforeAll(() => {
    const mock = jest.spyOn(OrderType, 'create');
    mock.mockReturnValue(createOrderType.response.type);
  });

  afterAll((done) => {
    jest.clearAllMocks();

    done();
  });

  it('should do sanity on the response of the create ordertype', async (done) => {
    const req = mockRequest();
    req.body = createOrderType.data;

    let resStatus;
    let resp;
    const res = {
      send() { },
      json(response) {
        resp = response;
      },
      status(responseStatus) {
        resStatus = responseStatus;
        return this;
      },
    };
    const error = {};

    await OrderTypeController.create(req, res, mockNext);

    expect(resStatus).toBe(httpStatus.CREATED);
    expect(resp.type).toEqual(createOrderType.response.type);
    expect(error).toEqual({});
    done();
  });
});
describe('listOrderType controller', () => {
  beforeAll(() => {
    const mock = jest.spyOn(OrderType, 'find');
    mock.mockReturnValue(listOrderType.response.types);
  });

  afterAll((done) => {
    jest.clearAllMocks();
    done();
  });

  it('should do sanity on the response of the list ordertype', async (done) => {
    const req = mockRequest();
    let resStatus;
    let resp;
    const res = {
      send() { },
      json(response) {
        resp = response;
      },
      status(responseStatus) {
        resStatus = responseStatus;
        return this;
      },
    };
    const error = {};

    await OrderTypeController.list(req, res, mockNext);

    expect(resStatus).toBe(httpStatus.OK);
    expect(resp.types).toEqual(listOrderType.response.types);
    expect(error).toEqual({});
    done();
  });
});

describe('readOrderType controller', () => {
  beforeAll(() => {
    const mock = jest.spyOn(OrderType, 'findOne');
    mock.mockReturnValue(readOrderType.response.type);
  });

  afterAll((done) => {
    jest.clearAllMocks();
    done();
  });

  it('should do sanity on the response of the read ordertype', async (done) => {
    const req = mockRequest();
    req.params.id = '5e716aaced8f8a76149bc38c';
    let resStatus;
    let resp;
    const res = {
      send() { },
      json(response) {
        resp = response;
      },
      status(responseStatus) {
        resStatus = responseStatus;
        return this;
      },
    };
    const error = {};

    await OrderTypeController.read(req, res, mockNext);

    expect(resStatus).toBe(httpStatus.OK);
    expect(resp.message).toBe(readOrderType.response.message);
    expect(resp.type).toEqual(readOrderType.response.type);
    expect(error).toEqual({});
    done();
  });
});

describe('updateOrderType controller', () => {
  beforeAll(() => {
    const mock = jest.spyOn(OrderType, 'findOneAndUpdate');
    mock.mockReturnValue(updateOrderType.response.type);
  });

  afterAll((done) => {
    jest.clearAllMocks();
    done();
  });

  it('should do sanity on the response of the update ordertype', async (done) => {
    const req = mockRequest();
    req.params.id = '5fb5e747e511c1a39346a7f3';
    let resStatus;
    let resp;
    const res = {
      send() { },
      json(response) {
        resp = response;
      },
      status(responseStatus) {
        resStatus = responseStatus;
        return this;
      },
    };
    const error = {};

    await OrderTypeController.update(req, res, mockNext);

    expect(resStatus).toBe(httpStatus.OK);
    expect(resp.type).toEqual(updateOrderType.response.type);
    expect(error).toEqual({});
    done();
  });
});

describe('deleteOrderType controller', () => {
  beforeAll(() => {
    jest.spyOn(OrderType, 'findOneAndUpdate');
  });

  afterAll((done) => {
    jest.clearAllMocks();
    done();
  });

  it('should do sanity on the response of the delete ordertype', async (done) => {
    const req = mockRequest();
    req.params.id = '5e716aaced8f8a76149bc38c';
    let resStatus;
    const res = {
      send() { },
      json() { },
      status(responseStatus) {
        resStatus = responseStatus;
        return this;
      },
    };
    const error = {};

    await OrderTypeController.delete(req, res, mockNext);

    expect(resStatus).toBe(httpStatus.NO_CONTENT);
    expect(error).toEqual({});
    done();
  });

  describe('do sanity on the response incase of no ordertype entry found', () => {
    beforeAll(() => {
      jest.spyOn(OrderType, 'findOneAndUpdate')
        .mockReturnValue(null);
      jest.spyOn(OrderType, 'findOne')
        .mockReturnValue(null);
    });
    afterAll((done) => {
      jest.clearAllMocks();
      done();
    });

    const req = {
      params: { id: 'test_ordertypeId#123' },
    };
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

    it('sanity on read function', async () => {
      const responseObj = await OrderTypeController.read(req, res, next);
      expect(responseObj.code).toBe(httpStatus.NOT_FOUND);
      expect(responseObj).toStrictEqual({
        code: httpStatus.NOT_FOUND,
        message: 'Resource not found',
      });
    });

    it('sanity on update function', async () => {
      const responseObj = await OrderTypeController.update(req, res, next);
      expect(responseObj.code).toBe(httpStatus.NOT_FOUND);
      expect(responseObj).toStrictEqual({
        code: httpStatus.NOT_FOUND,
        message: 'Resource not found',
      });
    });

    it('sanity on delete function', async () => {
      const responseObj = await OrderTypeController.delete(req, res, next);
      expect(responseObj.code).toBe(httpStatus.NOT_FOUND);
      expect(responseObj).toStrictEqual({
        code: httpStatus.NOT_FOUND,
        message: 'Resource not found',
      });
    });
  });

  describe('should call next with error in case of any runtime error', () => {
    const req = {};
    const res = mockResponse();
    const next = mockNext();

    it('sanity on read function', async () => {
      await OrderTypeController.read(req, res, next);
      expect(next).toBeCalled();
    });

    it('sanity on read function', async () => {
      await OrderTypeController.update(req, res, next);
      expect(next).toBeCalled();
    });

    it('sanity on read function', async () => {
      await OrderTypeController.delete(req, res, next);
      expect(next).toBeCalled();
    });
  });
});
