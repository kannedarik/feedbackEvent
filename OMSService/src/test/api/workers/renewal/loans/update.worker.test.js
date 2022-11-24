const updateworker = require('../../../../../api/workers/renewal/loans/update.worker');
const CoreService = require('../../../../../api/services/core.service');
const ErrorHandler = require('../../../../../api/utils/error');

const job = {
  variables: {
    signingrequests: [{ otp: 123 }],
  },
  response: {},
  complete: jest.fn(),
  fail: jest.fn(),
  error: jest.fn(),
};

describe('Update worker suite', () => {
  /**
   * Execute before all the test
   * Should be used for Mocking function etc
   */
  beforeAll(() => {
    const mock = jest.spyOn(CoreService, 'updateRenewalStatus');
    mock.mockReturnValue(job.response);

    const mockErrorHandler = jest.spyOn(ErrorHandler, 'captureWFError');
    mockErrorHandler.mockReturnValue({});
  });

  /**
   * Executes after all the test execution completes
   * Should be used for releasing all the Mock, Spies etc
   */
  afterAll(() => {
    jest.clearAllMocks();
  });

  /**
   * Test
   */
  it('should check whether falsy or truthy', async () => {
    await updateworker().taskHandler(job);
    expect(job.complete).toBeCalledWith(); // should be falsy
  });
});
