jest.mock('../../../../../../api/services/support.service');

const SupportService = require('../../../../../../api/services/support.service');
const UpdateSFTicket = require('../../../../../../api/workers/renewal/automation/failure/updateSFTicket.worker');

const { taskHandler } = UpdateSFTicket();

describe('Update SF ticket on automation failure', () => {
  it('calls the support service to mark SF ticket as automation failure', async () => {
    const orderId = 'orderId';
    const job = {
      variables: { orderid: orderId },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    };

    await taskHandler(job);
    expect(SupportService.updateSignStatus).toBeCalledWith(
      orderId,
      { Order_Automation_State: 'Automation Failed' },
    );
  });
});
