jest.mock('../../../api/utils/error');

const zeebeWorker = require('../../../api/utils/zeebeWorker');
const ErrorHandler = require('../../../api/utils/error');

describe('zeebeWorker', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('reports workflow errors if the taskHandler throws', async () => {
    const err = new Error('Something broke!');

    const job = {
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    };

    // eslint-disable-next-line no-unused-vars
    const worker = zeebeWorker('test.worker', async (_job, _complete) => {
      throw err;
    });

    await worker().taskHandler(job);

    expect(ErrorHandler.captureWFError).toHaveBeenCalledWith(job, err);
    expect(job.fail).toHaveBeenCalledWith('Something broke!');
  });

  it('returns the result of the taskHandler if there are no errors', async () => {
    const job = {
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    };

    // eslint-disable-next-line no-unused-vars
    const worker = zeebeWorker('test.worker', async (_job, _complete) => 'foo_bar');

    const result = await worker().taskHandler(job);

    expect(result).toEqual('foo_bar');
    expect(ErrorHandler.captureWFError).not.toHaveBeenCalled();
  });
});
