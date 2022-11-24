const physicalworker = require('../../../../../api/workers/renewal/document/physical.worker');
const CoreService = require('../../../../../api/services/core.service');
const ErrorHandler = require('../../../../../api/utils/error');

const job = {
  variables: {},
  response: {},
  complete: jest.fn(),
  fail: jest.fn(),
  error: jest.fn(),
};

describe('physical worker suits', () => {
  beforeAll(() => {
    const mock = jest.spyOn(CoreService, 'generatePhysicalPC');
    mock.mockReturnValue(job.response);

    const mockErrorHandler = jest.spyOn(ErrorHandler, 'captureWFError');
    mockErrorHandler.mockReturnValue({});
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('Check of physical return', async () => {
    await physicalworker().taskHandler(
      job,
    );
    expect(job.complete).toBeCalled();
  });
});
