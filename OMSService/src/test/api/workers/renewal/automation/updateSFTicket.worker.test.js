jest.mock('../../../../../api/services/support.service');

const UpdateSFTicketWorker = require('../../../../../api/workers/renewal/automation/updateSFTicket.worker');
const SupportService = require('../../../../../api/services/support.service');

describe('Worker to update the SF ticket during the automation flow', () => {
  it('calls Support Service with the update key from the job headers', async () => {
    const job = {
      customHeaders: {
        updateKey: 'automation_completed',
      },
      variables: {
        orderid: '123',
      },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    };

    await UpdateSFTicketWorker().taskHandler(job);

    expect(SupportService.updateSignStatus).toHaveBeenCalledWith('123', { Order_Automation_State: 'Automation Completed' });
    expect(job.complete).toHaveBeenCalled();
  });
});
