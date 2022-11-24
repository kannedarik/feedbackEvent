const summaryworker = require('../../../../../api/workers/renewal/document/summary.worker');
const CoreService = require('../../../../../api/services/core.service');
const ErrorHandler = require('../../../../../api/utils/error');

const job = {
  variables: {
    signingrequests: [{ otp: 123 }],
  },

  response: {
    link: 'sample_url_of_Summary',
  },
  complete: jest.fn(),
  fail: jest.fn(),
  error: jest.fn(),
};

describe(' summery worker suits ', () => {
  beforeAll(() => {
    const mock = jest.spyOn(CoreService, 'generateSummaryPC');

    mock.mockReturnValue(job.response);

    const MockHandler = jest.spyOn(ErrorHandler, 'captureWFError');
    MockHandler.mockReturnValue({});
  });

  afterAll(() => {
    jest.clearAllMock();
  });

  it('check whether url is returned or not', async () => {
    await summaryworker().taskHandler(
      job,
    );
    expect(job.complete).toBeCalledWith({
      summarydocument: { url: job.response.link },
    });
  });
});
