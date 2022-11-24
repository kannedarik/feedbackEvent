const Worker = require('../../../../../api/workers/loanEnhancement/tickets/create.worker');
const NotificationService = require('../../../../../api/services/notification.service');
const Constants = require('../../../../../api/utils/constants');
const CustomerFactory = require('../../../../factories/customer.factory');
const LenderFactory = require('../../../../factories/lender.factory');
const OrderFactory = require('../../../../factories/order.factory');
const OrderItemFactory = require('../../../../factories/orderitem.factory');
const OrderItem = require('../../../../../api/models/orderitem.model');
const Order = require('../../../../../api/models/order.model');
const OrderBankAccount = require('../../../../../api/models/orderbankaccount.model');
const CoreCache = require('../../../../../api/utils/cache/core');

const { taskHandler } = Worker();

jest.mock('../../../../../api/services/money_routing.service');

jest.mock('../../../../../api/utils/cache/notification', () => ({
  getCategories: jest.fn().mockResolvedValue(),
  getProviders: jest.fn().mockResolvedValue(),
  getTypes: jest.fn().mockResolvedValue(),
  getTemplates: jest.fn().mockResolvedValue(),
}));

describe('Create Loan Enhancement ticket on Salesforce', () => {
  let job;
  let complete;
  let order;
  let meta;
  let lender;
  let customer;
  let orderItems;

  beforeEach(async () => {
    lender = LenderFactory.build();
    meta = {
      repledgetype: Constants.repledgeType.LOAN_ENHANCEMENT,
      lenderid: lender.id,
      branchid: lender.branches[0].id,
      lmsid: 'fa1234',
      unsecurelmsid: 'fa123',
      oldsecureamount: 123456,
      oldunsecureamount: 12345,
    };
    customer = CustomerFactory.build();
    order = await OrderFactory.build({ customerId: customer.id });
    orderItems = [OrderItemFactory.build({ order, meta })];

    const getLendersSpy = jest.spyOn(CoreCache, 'getLenders');
    getLendersSpy.mockImplementation(async () => [lender]);

    const sendTicketSpy = jest.spyOn(NotificationService, 'sendTicket');
    sendTicketSpy.mockImplementation(async () => null);

    customer = CustomerFactory.build();
    order = await OrderFactory.build({ customerId: customer.id });

    job = {
      variables: {
        orderid: order._id,
        customer,
      },
      customHeaders: {
        category: 'transactional',
        provider: 'salesforce',
        type: 'ticket',
        template: 'LoanEnhancementTicketV1',
      },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    };
    complete = { success: jest.fn(), failure: jest.fn() };
  });

  afterEach(() => {
    NotificationService.sendTicket.mockClear();
  });

  it('calls send ticket on notification service', async () => {
    jest.spyOn(Order, 'findOne').mockResolvedValue(order);
    jest.spyOn(OrderBankAccount, 'findOne').mockResolvedValue(null);
    jest.spyOn(OrderItem, 'find')
      .mockReturnValue({
        lean: jest.fn().mockReturnValue(orderItems),
      });
    await taskHandler(job, complete);

    expect(job.complete).toBeCalled();
    expect(NotificationService.sendTicket).toBeCalled();
  });

  it('adds the GL Records to the data', async () => {
    jest.spyOn(Order, 'findOne').mockResolvedValue(order);
    jest.spyOn(OrderBankAccount, 'findOne').mockResolvedValue(null);
    jest.spyOn(OrderItem, 'find')
      .mockReturnValue({
        lean: jest.fn().mockReturnValue(orderItems),
      });

    await taskHandler(job, complete);

    const [[sentData]] = NotificationService.sendTicket.mock.calls;
    expect(sentData).toHaveProperty('custom.general_ledger', [
      {
        securedLoanAmount: 123456,
        unsecuredLoanAmount: 12345,
        securedLoanId: 'fa1234',
        unsecuredLoanId: 'fa123',
      },
    ]);
  });
});
