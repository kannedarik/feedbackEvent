const digitalworker = require('../../../../../api/workers/renewal/link/digital.worker');
const FirebaseUtil = require('../../../../../api/utils/firebase');
const ErrorHandler = require('../../../../../api/utils/error');

const job = {
  variables: {
    customerorder: '1234-123456-1234',
  },
  response: {
    shortLink: 'sample_url_of_digital',
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
  it('should check whether digital url are returned', async () => {
    await digitalworker().taskHandler(job);
    expect(job.complete).toBeCalledWith({
      shortlinks: [job.response.shortLink],
      signingsms: false,
    });
  });
});
