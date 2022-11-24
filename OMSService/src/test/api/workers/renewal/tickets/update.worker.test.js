jest.mock('zeebe-node');
jest.mock('../../../../../api/services/support.service');

const Worker = require('../../../../../api/workers/renewal/tickets/update.worker');
const SupportService = require('../../../../../api/services/support.service');
const ConfigWrapper = require('../../../../../config/wrapper');

describe('Salesforce ticket update worker', () => {
  it('sets the order automation state when renewal automation is enabled', async () => {
    const job = {
      variables: {
        automationState: 'automationCompleted',
        orderid: 'foo-order-id',
      },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    };

    jest.spyOn(ConfigWrapper, 'lookupBoolean').mockReturnValue(true);
    Worker().taskHandler(job);

    const [orderID, data] = SupportService.updateSignStatus.mock.calls[0];
    expect(orderID).toEqual('foo-order-id');
    expect(data).toHaveProperty('Order_Automation_State', 'Automation Completed');

    jest.restoreAllMocks();
  });
});
