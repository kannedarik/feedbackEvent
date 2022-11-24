require('../../dotenv');
const request = require('supertest');
const app = require('../../../src/config/express');
const { getUserLoansStatus } = require('../../../src/api/services/payments');

jest.mock('../../../src/api/services/payments', () => ({
  getUserLoansStatus: jest.fn(),
}));


jest.mock('../../../src/api/middlewares/auth', () => ({
  authorize: () => jest.fn(async (req, res, next) => {
    req.user = { token: '<TOKEN>' };
    next();
  }),
}));

describe('quickLinks', () => {
  it('response should have hasActiveLoans = true when user at least one active loan', async () => {
    getUserLoansStatus.mockImplementation(() => [{ statuscode: 5 }, { statuscode: 1 }]);
    const response = await request(app).get('/api/v1/loans/quick-links');
    expect(response.body).toHaveProperty('hasActiveLoans', true);
  });

  it('response should have hasActiveLoans = false when user has no active loans', async () => {
    getUserLoansStatus.mockImplementation(() => [{ statuscode: 5 }, { statuscode: 6 }]);
    const response = await request(app).get('/api/v1/loans/quick-links');
    expect(response.body).toHaveProperty('hasActiveLoans', false);
  });
});
