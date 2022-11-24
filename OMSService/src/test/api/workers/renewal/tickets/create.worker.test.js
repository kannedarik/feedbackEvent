jest.mock('zeebe-node');

const Worker = require('../../../../../api/workers/renewal/tickets/create.worker');
const NotificationService = require('../../../../../api/services/notification.service');
const Constants = require('../../../../../api/utils/constants');
const RenewalOrder = require('../../../../../api/models/renewalorder.model');
const OrderBankAccount = require('../../../../../api/models/orderbankaccount.model');
const OrderItem = require('../../../../../api/models/orderitem.model');

const ConfigWrapper = require('../../../../../config/wrapper');

const CustomerFactory = require('../../../../factories/customer.factory');
const LenderFactory = require('../../../../factories/lender.factory');
const RenewalOrderFactory = require('../../../../factories/renewalorder.factory');
const OrderItemFactory = require('../../../../factories/orderitem.factory');

const CoreCache = require('../../../../../api/utils/cache/core');

const { taskHandler } = Worker();

jest.mock('../../../../../api/services/money_routing.service');

jest.mock('../../../../../api/utils/cache/notification', () => ({
  getCategories: jest.fn().mockResolvedValue(),
  getProviders: jest.fn().mockResolvedValue(),
  getTypes: jest.fn().mockResolvedValue(),
  getTemplates: jest.fn().mockResolvedValue(),
}));

describe('Create Renewal ticket on Salesforce', () => {
  let job;
  let order;
  let meta;
  let lender;
  let customer;
  let orderItems;

  beforeEach(async () => {
    lender = LenderFactory.build();

    const getLendersSpy = jest.spyOn(CoreCache, 'getLenders');
    getLendersSpy.mockImplementation(async () => [lender]);

    const sendTicketSpy = jest.spyOn(NotificationService, 'sendTicket');
    sendTicketSpy.mockImplementation(async () => null);

    customer = CustomerFactory.build();
    order = RenewalOrderFactory.build({ customerId: customer.id });
    meta = {
      repledgetype: Constants.repledgeType.ENHANCE,
      lenderid: lender.id,
      branchid: lender.branches[0].id,
      lmsid: 'fa1234',
      unsecurelmsid: 'fa123',
      oldsecureamount: 123456,
      oldunsecureamount: 12345,
    };
    orderItems = [OrderItemFactory.build({ order, meta })];

    job = {
      variables: {
        orderid: order._id,
        customer,
        cityid: 1,
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
  });

  afterEach(() => {
    NotificationService.sendTicket.mockClear();
    jest.restoreAllMocks();
  });

  it('calls send ticket on notification service', async () => {
    jest.spyOn(RenewalOrder, 'findOne').mockResolvedValue(order);
    jest.spyOn(OrderBankAccount, 'findOne').mockResolvedValue(null);
    jest.spyOn(OrderItem, 'find')
      .mockReturnValue({
        lean: jest.fn().mockReturnValue(orderItems),
      });
    await taskHandler(job);

    expect(job.complete).toBeCalled();
    expect(NotificationService.sendTicket).toBeCalled();
  });

  it('adds the GL Records to the data', async () => {
    jest.spyOn(RenewalOrder, 'findOne').mockResolvedValue(order);
    jest.spyOn(OrderBankAccount, 'findOne').mockResolvedValue(null);
    jest.spyOn(OrderItem, 'find')
      .mockReturnValue({
        lean: jest.fn().mockReturnValue(orderItems),
      });
    await taskHandler(job);

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

  describe('testing for order automation', () => {
    describe('when order automation is enabled', () => {
      it('sets the orderAutomationState to automated', async () => {
        const orderUpdated = RenewalOrderFactory.build({ order, automationState: 'automated' });

        jest.spyOn(ConfigWrapper, 'lookupBoolean').mockReturnValue(true);
        jest.spyOn(RenewalOrder, 'findOne').mockResolvedValue(orderUpdated);
        jest.spyOn(OrderBankAccount, 'findOne').mockResolvedValue(null);
        jest.spyOn(OrderItem, 'find')
          .mockReturnValue({
            lean: jest.fn().mockReturnValue(orderItems),
          });

        await taskHandler(job);

        const [[sentData]] = NotificationService.sendTicket.mock.calls;

        expect(sentData).toHaveProperty('custom.orderAutomationState', 'automated');
      });
    });

    describe('when order automation is not enabled', () => {
      it('sets the orderAutomationState to manual', async () => {
        const orderUpdated = RenewalOrderFactory.build({ order, automationState: 'manual' });
        jest.spyOn(ConfigWrapper, 'lookupBoolean').mockReturnValue(true);
        jest.spyOn(RenewalOrder, 'findOne').mockResolvedValue(orderUpdated);
        jest.spyOn(OrderBankAccount, 'findOne').mockResolvedValue(null);
        jest.spyOn(OrderItem, 'find')
          .mockReturnValue({
            lean: jest.fn().mockReturnValue(orderItems),
          });

        await taskHandler(job);

        const [[sentData]] = NotificationService.sendTicket.mock.calls;

        expect(sentData).toHaveProperty('custom.orderAutomationState', 'manual');
      });
    });

    describe('when the order automation feature toggle is off', () => {
      it('doesn\'t set the orderAutomationState field', async () => {
        jest.spyOn(ConfigWrapper, 'lookupBoolean').mockReturnValue(false);
        jest.spyOn(RenewalOrder, 'findOne').mockResolvedValue(order);
        jest.spyOn(OrderBankAccount, 'findOne').mockResolvedValue(null);
        jest.spyOn(OrderItem, 'find')
          .mockReturnValue({
            lean: jest.fn().mockReturnValue(orderItems),
          });

        await taskHandler(job);
        const [[sentData]] = NotificationService.sendTicket.mock.calls;

        expect(sentData.custom.orderAutomationState).toBeUndefined();
      });
    });
  });
});
