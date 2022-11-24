jest.mock('../../../../../api/services/core.service');
const UpdateLenderPortalWorker = require('../../../../../api/workers/renewal/automation/updateLenderPortal.worker');
const OrderFactory = require('../../../../factories/order.factory');
const OrderItemFactory = require('../../../../factories/orderitem.factory');
const CoreService = require('../../../../../api/services/core.service');
const OrderItem = require('../../../../../api/models/orderitem.model');

const { taskHandler } = UpdateLenderPortalWorker();

describe('Update lender portal worker', () => {
  let job;
  let complete;
  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeEach(async () => {
    job = {
      variables: {
        orderid: 'test-orderid',
        token: 'access-token',
      },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    };
    complete = {
      success: jest.fn(),
      failure: jest.fn(),
      error: jest.fn(),
    };
    jest.restoreAllMocks();
  });

  it('it sends core loan ids to the send lender notification api', async () => {
    const order = await OrderFactory.build();
    const orderItems = [
      OrderItemFactory.build({ order }),
      OrderItemFactory.build({ order }),
    ];
    jest.spyOn(OrderItem, 'find').mockResolvedValue(orderItems);
    await taskHandler(job, complete);

    expect(CoreService.sendLenderNotification).toHaveBeenCalledWith(
      job.variables.token,
      orderItems.map((item) => item.meta.losid),
    );
    expect(job.complete).toHaveBeenCalled();
  });

  it('fails the worker if order items are empty', async () => {
    const orderWithNoItems = await OrderFactory.build();
    job.variables.orderid = orderWithNoItems._id;
    jest.spyOn(OrderItem, 'find').mockResolvedValue(null);
    await taskHandler(job, complete);

    expect(job.fail).toHaveBeenCalledWith('No order items for this order');
  });

  it('raises the renewal_automation_error workflow error if an exception is thrown', async () => {
    const order = await OrderFactory.build();
    const orderItems = [
      OrderItemFactory.build({ order }),
      OrderItemFactory.build({ order }),
    ];
    jest.spyOn(OrderItem, 'find').mockResolvedValue(orderItems);
    CoreService.sendLenderNotification.mockImplementation(async () => {
      throw new Error('Something happened!');
    });

    await taskHandler(job);
    expect(job.error).toHaveBeenCalledWith('renewal_automation_error', 'Something happened!');
  });
});
