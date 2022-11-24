jest.mock('../../../../../api/services/rupeek.service');
const RupeekService = require('../../../../../api/services/rupeek.service');
const resetWorker = require('../../../../../api/workers/partrelease/salesforce/reset.worker');

describe('Worker for calling rupeek-web service for reseting the transaction status', () => {
  const factory = {
    job: {
      variables: {
        token: '',
        freshLoanId: '60643a64acc678fa62579eee',
        timeslotstart: 1617608700,
        timeslotend: 1617615000,
        cityId: 1,
        isPISlot: false,
        isRelatedLoan: true,
        isRescheduling: true,
      },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    },
    response: {
      request: {
        statuscode: 1.4,
      },
      UserMsg: 'Request Approved Succcessfully',
      status: 200,
    },
  };

  it('should reset transaction status', async () => {
    const { job, response } = factory;
    const {
      variables: {
        token, freshLoanId, timeslotstart, timeslotend, cityId,
      },
    } = job;
    const data = {
      isscheduled: true,
      requestid: freshLoanId,
      timeslotstart,
      timeslotend,
      cityid: cityId,
    };

    RupeekService.resetTransactionStatus.mockResolvedValue({ ...response });
    await resetWorker().taskHandler(job);
    expect(RupeekService.resetTransactionStatus).toHaveBeenCalledWith(token, data);
    expect(job.complete).toHaveBeenCalled();
  });
});
