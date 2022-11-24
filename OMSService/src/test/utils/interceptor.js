module.exports = {
  mockRequest: () => {
    const req = {};
    req.body = jest.fn().mockReturnValue({});
    req.params = jest.fn().mockReturnValue({});
    req.user = jest.fn().mockReturnValue({});
    req.query = jest.fn().mockReturnValue({});
    return req;
  },

  mockResponse: () => {
    const res = {};
    res.send = jest.fn().mockReturnValue({});
    res.status = jest.fn().mockReturnValue({});
    res.json = jest.fn().mockReturnValue({});
    return res;
  },
  mockNext: () => jest.fn(),
};
