const documentworker = require('../../../../../api/workers/renewal/link/document.worker');
const FirebaseUtil = require('../../../../../api/utils/firebase');
const ErrorHandler = require('../../../../../api/utils/error');

const job = {
  variables: {
    secureddocument: {
      url: 'sample_url_of_secureddocument',
    },
    unsecureddocument: {
      url: 'sample_url_of_unsecureddocument',
    },
    summarydocument: {
      url: 'sample_url_of_summarydocument',
    },
  },
  response: {
    shortLink: 'sample_url_of_documents',
  },
  shortlinks: ['sample_url_of_documents', 'sample_url_of_documents', 'sample_url_of_documents'],
  complete: jest.fn(),
  fail: jest.fn(),
  error: jest.fn(),
};

describe('document worker suite', () => {
  /**
     * Execute before all the test
     * Should be used for Mocking function etc
     */
  beforeAll(() => {
    /**
       * Mocking API to FirebaseUtil service
       * @type {never}
       */

    const mock = jest.spyOn(FirebaseUtil, 'createLink');
    mock.mockReturnValue(job.response);

    /**
       * Mocking Error handler to stop false reporting of errors
       * @type {never}
       */
    const mockErrorHandler = jest.spyOn(ErrorHandler, 'captureWFError');
    mockErrorHandler.mockReturnValue({});
  });

  /**
     * Test
     */
  it('should check whether document url are returned', async () => {
    await documentworker().taskHandler(job);
    expect(job.complete).toBeCalledWith({ shortlinks: job.shortlinks });
  });
});
