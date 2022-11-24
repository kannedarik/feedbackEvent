const esignworker = require('../../../../../api/workers/renewal/link/esign.worker');
const FirebaseUtil = require('../../../../../api/utils/firebase');
const ErrorHandler = require('../../../../../api/utils/error');

const job = {
  variables: {
    customerorder: '1234-123456-1234',
  },
  response: {
    shortLink: 'sample_url_of_esign',
  },
  complete: jest.fn(),
  fail: jest.fn(),
  error: jest.fn(),
};

describe('esign worker suite', () => {
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
  it('should check whether esign url are returned', async () => {
    await esignworker().taskHandler(job);
    expect(job.complete).toBeCalledWith({
      shortlinks: [job.response.shortLink],
      signingsms: false,
    });
  });
});
