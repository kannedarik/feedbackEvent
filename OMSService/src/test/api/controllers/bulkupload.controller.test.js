jest.mock('zeebe-node');
const mockUserID = 123;

const supertest = require('supertest');
const path = require('path');
const app = require('../../../config/express');

const apiRoute = '/api/v1/differentialscheme/bulkupload';
const filePath = path.resolve(__dirname, '../testfiles/');

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

describe('File Bulk Upload', () => {
  describe('identifier field in request body', () => {
    it('should throw error when no identifier field is mentioned in the request body', async () => {
      const response = await supertest(app)
        .post(apiRoute)
        .attach('file', path.join(filePath, 'MOCK_DATA_10.csv'));

      expect(response.status).toBe(400);
      expect(response.body.errors).toBe('"identifier" is required');
    });
  });

  describe('file extension should be .csv', () => {
    it('should throw validation error when file extension is not .csv', async () => {
      const response = await supertest(app)
        .post(apiRoute)
        .field('identifier', 'differentialschemesActivate')
        .attach('file', path.join(filePath, 'MOCK_DATA_10.txt'));

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('File upload only supports the following filetypes - CSV');
    });
  });

  describe('row count exceed limit', () => {
    it('should throw error when number of rows in the file exceeds 1000', async () => {
      const response = await supertest(app)
        .post(apiRoute)
        .field('identifier', 'differentialSchemeActivation')
        .attach('file', path.join(filePath, 'MOCK_DATA_1001.csv'));

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Too many rows uploaded at once');
    });
  });

  describe('invalid identifier', () => {
    it('should throw error when identifier is invalid', async () => {
      const response = await supertest(app)
        .post(apiRoute)
        .field('identifier', 'edit')
        .attach('file', path.join(filePath, 'MOCK_DATA_10.csv'));

      expect(response.status).toBe(400);
      expect(response.body.errors).toBe('"identifier" must be one of [differentialSchemeActivation, differentialSchemeDeactivation]');
    });
  });
});
