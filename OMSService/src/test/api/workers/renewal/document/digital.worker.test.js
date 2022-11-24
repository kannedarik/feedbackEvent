const digitalworker = require('../../../../../api/workers/renewal/document/digital.worker');
const CoreService = require('../../../../../api/services/core.service');
const ErrorHandler = require('../../../../../api/utils/error');

const job = {
  variables: {
    signingrequests: [{ otp: 123 }],
  },
  response: {
    signedpcurl: 'sample_url_of_signed_document',
    usignedpcurl: 'sample_url_of_unsigned_document',
  },
  complete: jest.fn(),
  fail: jest.fn(),
  error: jest.fn(),
};

describe('Digital worker suite', () => {
  /**
   * Execute before all the test
   * Should be used for Mocking function etc
   */
  beforeAll(() => {
    /**
     * Mocking API to CORE service
     * @type {never}
     */
    const mock = jest.spyOn(CoreService, 'generateSignedDigiPC');
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
  it('should check whether document url are getting injected in job.variables', async () => {
    await digitalworker().taskHandler(job);
    expect(job.complete).toBeCalledWith({
      secureddocument: { url: job.response.signedpcurl },
      unsecureddocument: { url: job.response.usignedpcurl },
    });
  });
});
