jest.mock('../../../../../../api/services/insight.service');
const InsightService = require('../../../../../../api/services/insight.service');
const confirmWorker = require('../../../../../../api/workers/partrelease/salesforce/slot/confirm.worker');

describe('Worker for confirming slot by calling Insight service ', () => {
  const factory = {
    job: {
      variables: {
        token: '',
        slotId: '605328416a2ed6344007b723',
        partreleaseTransactionId: '5dd4f3ff1e851db41f3f44fb',
        agentsrequired: 1,
      },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    },
    response: {
      code: 200,
      message: 'Slot confirmed successfully',
      slot: {
        bookedagents: 1,
        overbookslot: false,
        archived: false,
        _id: '60475de8ebd2160db120b917',
        start: '2021-03-10T08:15:00.000Z',
        end: '2021-03-10T10:00:00.000Z',
        priority: '5e2719f78a26a94eccd49a87',
        group: '5e9e8a27b0b74f5db2eea62c',
        availableagents: 1,
        city: 11,
        createdAt: '2021-03-09T11:37:12.987Z',
        updatedAt: '2021-03-09T11:41:18.146Z',
        __v: 0,
        loan: '60475ede4354cee234c6db8d',
      },
    },
  };

  it('should confirm new slot', async () => {
    const { job, response } = factory;
    const {
      variables: {
        token, slotId, partreleaseTransactionId, agentsrequired,
      },
    } = job;
    const data = {
      requestid: partreleaseTransactionId,
      agentsrequired,
    };

    InsightService.confirmSlot.mockResolvedValue({ ...response });
    await confirmWorker().taskHandler(job);

    expect(InsightService.confirmSlot).toHaveBeenCalledWith(token, slotId, data);
    expect(job.complete).toHaveBeenCalledWith({ confirmedSlot: response.slot });
  });
});
