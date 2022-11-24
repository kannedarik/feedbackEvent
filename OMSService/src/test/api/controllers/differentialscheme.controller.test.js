jest.mock('zeebe-node');
const supertest = require('supertest');
const moment = require('moment');
let app = require('../../../config/express');
const DifferentialSchemeFactory = require('../../factories/loantorenewalscheme.factory');
const DifferentialScheme = require('../../../api/models/loantorenewalschememap.model');
const { downloadFromS3 } = require('../../../api/utils/AWSUtils');

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

jest.mock('../../../api/utils/AWSUtils');

app = supertest(app);

describe('Differential Scheme', () => {
  describe('Download Sample Files', () => {
    it('should throw Validation error when no template Name is mentioned in the request query', async () => {
      const response = await app
        .post('/api/v1/differentialscheme/downloadSample');
      expect(response.status).toBe(400);
      expect(response.body.errors).toBe('"templateName" is required');
    });

    it('should throw Validation error when incorrect template Name is mentioned in the request query', async () => {
      const response = await app
        .post('/api/v1/differentialscheme/downloadSample')
        .query({ templateName: 'test' });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBe('"templateName" must be one of [activate, deactivate]');
    });
    it('should display the Deactivate Template ', async () => {
      const response = await app
        .post('/api/v1/differentialscheme/downloadSample')
        .query({ templateName: 'deactivate' });

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/csv'); // checks if we are getting a csv file
      expect(response.text).toBe('GLId\n<insert GLID>');
    });
    it('should display the Activate Template ', async () => {
      const response = await app
        .post('/api/v1/differentialscheme/downloadSample')
        .query({ templateName: 'activate' });

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/csv'); // checks if we are getting a csv file
      expect(response.text).toBe('GLId,scheme\n<insert GLID>,<insert Scheme>');
    });
  });

  describe('Download Loan to Scheme mapping', () => {
    const renderDiffScheme = (diffScheme) => ` ${diffScheme.GLId},${diffScheme.scheme},${diffScheme.uploadedBy},${moment(diffScheme.lastUploadedAt).utc().add(5.5, 'hours').format('DD_MM_YY_hh_mm_ss')}\n`;

    it('should fetch all results, paginate them and filters out the mappings with \'INACTIVE\' status; displays the first page by default', async () => {
      const diffScheme1 = await DifferentialSchemeFactory.build({ GLId: '1' });
      await DifferentialSchemeFactory.build({ GLId: '2', status: 'INACTIVE' });

      jest.spyOn(DifferentialScheme, 'countDocuments').mockResolvedValueOnce(1);
      jest.spyOn(DifferentialScheme, 'find').mockImplementationOnce(() => ({
        sort: () => ({
          select: () => [diffScheme1],
        }),
      }));
      jest.spyOn(diffScheme1, 'toObject').mockImplementationOnce(() => diffScheme1);

      const response = await app
        .post('/api/v1/differentialscheme/download');

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/csv'); // checks if we are getting a csv file
      expect(response.text).toBe(` GLId, scheme, uploadedBy, lastUploadedAt\n${renderDiffScheme(diffScheme1)}`);
    });

    it('should fetch the interesection of the filter conditions', async () => {
      const diffScheme1 = await DifferentialSchemeFactory.build({
        GLId: '1', scheme: 'scheme1', uploadedBy: 'user1',
      });
      await DifferentialSchemeFactory.build({
        GLId: '2', scheme: 'scheme2', uploadedBy: 'user1', status: 'INACTIVE',
      });
      const diffScheme3 = await DifferentialSchemeFactory.build({
        GLId: '3', scheme: 'scheme3', uploadedBy: 'user2',
      });
      await DifferentialSchemeFactory.build({
        GLId: '4', scheme: 'scheme2', uploadedBy: 'user3',
      });
      await DifferentialSchemeFactory.build({
        GLId: '5', scheme: 'scheme2', uploadedBy: 'user1',
      });

      jest.spyOn(DifferentialScheme, 'countDocuments').mockResolvedValueOnce(2);
      jest.spyOn(DifferentialScheme, 'find').mockImplementationOnce(() => ({
        sort: () => ({
          select: () => [diffScheme1, diffScheme3],
        }),
      }));
      jest.spyOn(diffScheme1, 'toObject').mockImplementationOnce(() => diffScheme1);
      jest.spyOn(diffScheme3, 'toObject').mockImplementationOnce(() => diffScheme3);

      const response = await app
        .post('/api/v1/differentialscheme/download')
        .send({ GLId: '1,2,3,4', scheme: 'scheme1,scheme2,scheme3', uploadedBy: 'user1,user2' });

      // Query is: (GLId= 1||2||3||4) && (scheme= scheme1||scheme2||scheme3) && (user=user1||user2)
      // only the diffScheme1 and diffScheme3 satisy this
      expect(response.status).toBe(200);
      expect(response.type).toBe('text/csv'); // checks if we are getting a csv file
      expect(response.text).toBe(` GLId, scheme, uploadedBy, lastUploadedAt\n${renderDiffScheme(diffScheme1)}${renderDiffScheme(diffScheme3)}`);
    });
  });

  describe('Download from S3', () => {
    it('should throw Validation error when incorrect bucket is mentioned in the request query', async () => {
      const response = await app
        .post('/api/v1/differentialscheme/errorfile')
        .query({
          bucket: 'testbucket',
          path: 'differentialschemes',
          fileName: 'test.csv',
          identifier: 'differentialSchemeActivation',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBe('"bucket" must be [differentialSchemeS3Bucket]');
    });

    it('should throw Validation error when a file other than .csv is mentioned in the request query', async () => {
      const query = {
        bucket: 'differentialSchemeS3Bucket',
        path: 'differentialschemes',
        fileName: 'test.txt',
        identifier: 'differentialSchemeActivation',
      };
      const response = await app
        .post('/api/v1/differentialscheme/errorfile')
        .query(query);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBe(`"fileName" with value "${query.fileName}" fails to match the .csv file format pattern`);
    });

    it('should throw Validation error when incorrect identifier is mentioned in the request query', async () => {
      const response = await app
        .post('/api/v1/differentialscheme/errorfile')
        .query({
          bucket: 'differentialSchemeS3Bucket',
          path: 'differentialschemes',
          fileName: 'test.csv',
          identifier: 'Incorrect-Identifier',
        });
      expect(response.status).toBe(400);
      expect(response.body.errors).toBe('"identifier" must be one of [differentialSchemeActivation, differentialSchemeDeactivation]');
    });

    it('should throw Validation error when incorrect Path is mentioned in the request query', async () => {
      const response = await app
        .post('/api/v1/differentialscheme/errorfile')
        .query({
          bucket: 'differentialSchemeS3Bucket',
          path: 'Incorrect-path',
          fileName: 'test.csv',
          identifier: 'differentialSchemeActivation',
        });
      expect(response.status).toBe(400);
      expect(response.body.errors).toBe('"path" must be [differentialschemes]');
    });

    it('should set the content-type of the response as csv and returns the contents of the S3 file', async () => {
      const csvString = { Body: 'GLId,scheme,status\n1,A,SUCCESS\n2,B,SUCCESS\n3,C,SUCCESS\n4,D,SUCCESS\n5,E,SUCCESS\n' };
      downloadFromS3.mockResolvedValueOnce(csvString);
      const response = await app
        .post('/api/v1/differentialscheme/errorfile')
        .query({
          bucket: 'differentialSchemeS3Bucket',
          path: 'differentialschemes',
          fileName: 'test.csv',
          identifier: 'differentialSchemeActivation',
        });
      expect(response.status).toBe(200);
      expect(response.text).toBe(csvString.Body);
    });
  });

  describe('Fetch Overidden Renewal Scheme', () => {
    it('should give Validation error when "selectedLoanIDs" is not mentioned', async () => {
      const response = await app
        .get('/api/v1/differentialscheme/schemes')
        .query({
          totalLoanIDs: '',
          pendingLoanIDs: '',
        });
      expect(response.status).toBe(400);
      expect(response.body.errors).toBe('"selectedLoanIDs" is required');
    });

    it('should give Validation error when "totalLoanIDs" is not mentioned', async () => {
      const response = await app
        .get('/api/v1/differentialscheme/schemes')
        .query({
          selectedLoanIDs: '',
          pendingLoanIDs: '',
        });
      expect(response.status).toBe(400);
      expect(response.body.errors).toBe('"totalLoanIDs" is required');
    });

    it('should give Validation error when "pendingLoanIDs" is not mentioned', async () => {
      const response = await app
        .get('/api/v1/differentialscheme/schemes')
        .query({
          selectedLoanIDs: '',
          totalLoanIDs: '',
        });
      expect(response.status).toBe(400);
      expect(response.body.errors).toBe('"pendingLoanIDs" is required');
    });

    it('should give out empty string when no oeverloaded scheme is found', async () => {
      jest.spyOn(DifferentialScheme, 'find').mockImplementationOnce(() => ({
        select: () => null,
      }));

      const response = await app
        .get('/api/v1/differentialscheme/schemes')
        .query({
          selectedLoanIDs: '1,2',
          totalLoanIDs: '1,2',
          pendingLoanIDs: '',
        });
      expect(response.status).toBe(200);
      expect(response.body.schemeIDs).toStrictEqual({
        selectedSchemeID: '',
        totalSchemeID: '',
        pendingSchemeID: '',
      });
    });

    it('should fetch out correct overridden scheme from the database', async () => {
      const diffScheme1 = await DifferentialSchemeFactory.build({ GLId: '1', scheme: 'scheme1' });
      await DifferentialSchemeFactory.build({ GLId: '2', status: 'INACTIVE', scheme: 'scheme2' });
      const diffScheme3 = await DifferentialSchemeFactory.build({ GLId: '3', scheme: 'scheme3' });

      // finding One LoanToScheme Mapping for the SelectedLoans GLIDs
      jest.spyOn(DifferentialScheme, 'find').mockImplementationOnce(() => ({
        select: () => diffScheme1,
      }));
      // finding One LoanToScheme Mapping for the totalLoans GLIDs
      jest.spyOn(DifferentialScheme, 'find').mockImplementationOnce(() => ({
        select: () => diffScheme1,
      }));
      // finding One LoanToScheme Mapping for the pendingLoans GLIDs
      jest.spyOn(DifferentialScheme, 'find').mockImplementationOnce(() => ({
        select: () => diffScheme3,
      }));

      const response = await app
        .get('/api/v1/differentialscheme/schemes')
        .query({
          selectedLoanIDs: '1',
          totalLoanIDs: '1,2,3',
          pendingLoanIDs: '2,3',
        });

      expect(response.status).toBe(200);
    });
  });
});
