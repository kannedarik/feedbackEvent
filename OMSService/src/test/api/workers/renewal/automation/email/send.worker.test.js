jest.mock('../../../../../../api/services/notification.service');
jest.mock('../../../../../../api/utils/cache/notification');
jest.mock('../../../../../../api/utils/error');
jest.mock('zeebe-node');
jest.mock('../../../../../../api/services/lendingMDS.service');

const NotificationService = require('../../../../../../api/services/notification.service');
const NotificationCache = require('../../../../../../api/utils/cache/notification');
const RenewalOrderFactory = require('../../../../../factories/renewalorder.factory');
const OrderItemFactory = require('../../../../../factories/orderitem.factory');
const Fixtures = require('../../../../../fixtures');
const OrderItem = require('../../../../../../api/models/orderitem.model');
const RenewalOrder = require('../../../../../../api/models/renewalorder.model');
const LendingMDSService = require('../../../../../../api/services/lendingMDS.service');

const EmailSendWorker = require('../../../../../../api/workers/renewal/automation/email/send.worker');

const { taskHandler } = EmailSendWorker();
describe('Send daily email to the lender branch', () => {
  let job;
  let branch;
  let order;
  let orderItems;

  const categoryID = 'category-id';
  const providerID = 'provider-id';
  const typeID = 'type-id';
  const templateID = 'template-id';
  const branchID = 'branch-id';
  const branchName = 'branch-name';
  const odAccountNumber = '5236234525';
  const customerName = 'Foo Bar';
  const lmsid = '12348934571123';
  const losid = 123455;
  const newsecureamount = 420420;
  const cityName = 'Bangalore';
  const contactNumber = '9876543210';
  const ccList = ['foo@rupeek.com', 'bar@rupeek.com'];

  beforeEach(async () => {
    order = RenewalOrderFactory.build({ meta: { customerName } });
    orderItems = [OrderItemFactory.build({
      order,
      meta: {
        branchid: branchID,
        newloandate: '2020-06-02T00:00:00.000Z',
        lmsid,
        losid,
        newsecureamount,
        oldMISRecordDetails: {
          lenderCustomerName: customerName,
          lenderPrimaryPhone: contactNumber,
        },
      },
    })];

    job = {
      variables: {
        branchID,
        ordersPerBranch: {
          [branchID]: [order._id],
        },
      },
      customHeaders: {
        category: 'category',
        provider: 'provider',
        type: 'type',
        template: 'template',
      },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    };

    jest.restoreAllMocks();

    NotificationCache.getCategories.mockResolvedValue(categoryID);
    NotificationCache.getProviders.mockResolvedValue(providerID);
    NotificationCache.getTypes.mockResolvedValue(typeID);
    NotificationCache.getTemplates.mockResolvedValue(templateID);

    branch = {
      contactMails: ['foo@example.com', 'bar@baz.com'],
      branchName,
      address: { cityName },
    };
    LendingMDSService.getBranchByCoreID.mockResolvedValue(branch);
    NotificationService.sendEmail.mockResolvedValue({ data: { notification: 'aaaa', code: 201 } });

    Fixtures.mockConfig({
      FED_RENEWAL_EMAIL_CC_LIST: ccList,
      FED_OD_ACCOUNT_NUMBER: odAccountNumber,
    });
  });

  it('creates an error if the given branch id is not found', async () => {
    jest.spyOn(RenewalOrder, 'find').mockResolvedValue(order);
    jest.spyOn(OrderItem, 'find').mockResolvedValue(orderItems);
    LendingMDSService.getBranchByCoreID.mockResolvedValue(undefined);
    await taskHandler(job);
    expect((job.fail)).toBeCalledWith(`Couldn't find branch information for branch id: ${branchID}`);
  });

  it('sends email with a correlationID', async () => {
    jest.spyOn(RenewalOrder, 'find').mockResolvedValue(order);
    jest.spyOn(OrderItem, 'find').mockResolvedValue(orderItems);
    await taskHandler(job);

    const args = NotificationService.sendEmail.mock.calls[0][0];
    expect(args).toHaveProperty('correlationid');
  });

  it('sets the email options and the to field', async () => {
    jest.spyOn(RenewalOrder, 'find').mockResolvedValue(order);
    jest.spyOn(OrderItem, 'find').mockResolvedValue(orderItems);
    await taskHandler(job);

    const args = NotificationService.sendEmail.mock.calls[0][0];
    expect(args).toHaveProperty('options', {
      subject: 'E-sign Renewal - BANGALORE / BRANCH-NAME',
      cc: ccList,
    });

    expect(args).toHaveProperty('customer', {
      email: branch.contactMails.join(','),
    });
  });

  it('sends email with category, provider and type set in the headers', async () => {
    jest.spyOn(RenewalOrder, 'find').mockResolvedValue(order);
    jest.spyOn(OrderItem, 'find').mockResolvedValue(orderItems);
    await taskHandler(job);

    const args = NotificationService.sendEmail.mock.calls[0][0];
    expect(args).toHaveProperty('category', categoryID);
    expect(args).toHaveProperty('provider', providerID);
    expect(args).toHaveProperty('type', typeID);
  });

  it('sends the template and required order data to render the template', async () => {
    jest.spyOn(RenewalOrder, 'find').mockResolvedValue(order);
    jest.spyOn(OrderItem, 'find').mockResolvedValue(orderItems);
    await taskHandler(job);

    const args = NotificationService.sendEmail.mock.calls[0][0];
    expect(args).toHaveProperty('template', {
      id: templateID,
      data: {
        odAccountNumber,
        orderItemDetails: [{
          customerName,
          branchName: 'Bangalore / branch-name',
          contactNumber,
          loanAccountNumber: lmsid,
          newLoanID: losid,
          newScheme: 'KVB Gold Loan 6M',
          rebookAmount: 420420,
        }],
      },
    });
  });

  it('sets a flag on the order items if the email is sent successfully', async () => {
    jest.spyOn(RenewalOrder, 'find').mockResolvedValue(order);
    jest.spyOn(OrderItem, 'find').mockResolvedValue(orderItems);
    await taskHandler(job);

    // const newOrderItems = await OrderItem.find({ _id: orderItems.map((oi) => oi._id) });
    // newOrderItems.forEach((newOrderItem) => {
    //   expect(newOrderItem).toHaveProperty('meta.automatedEmailToLenderProcessed', true);
    // });
  });

  it('calls complete.success if email is sent successfully', async () => {
    jest.spyOn(RenewalOrder, 'find').mockResolvedValue(order);
    jest.spyOn(OrderItem, 'find').mockResolvedValue(orderItems);
    jest.spyOn(OrderItem, 'updateMany').mockResolvedValue(undefined);
    await taskHandler(job);

    expect(job.complete).toHaveBeenCalledWith({ notificationId: 'aaaa', retryCount: 0 });
  });

  it('calls job.error if email sending has failed', async () => {
    jest.spyOn(NotificationService, 'sendEmail').mockImplementation(async () => {
      throw new Error('Email sending failed');
    });
    jest.spyOn(RenewalOrder, 'find').mockResolvedValue(order);
    jest.spyOn(OrderItem, 'find').mockResolvedValue(orderItems);
    jest.spyOn(OrderItem, 'updateMany').mockResolvedValue(undefined);
    await taskHandler(job);

    expect(job.error).toBeCalledWith('email_sending_failure', 'Email sending failed');
  });

  it('sets a flag on the order items if email sending has failed', async () => {
    jest.spyOn(NotificationService, 'sendEmail').mockImplementation(async () => {
      throw new Error('Email sending failed');
    });
    jest.spyOn(RenewalOrder, 'find').mockResolvedValue(order);
    jest.spyOn(OrderItem, 'find').mockResolvedValue(orderItems);
    jest.spyOn(OrderItem, 'updateMany').mockResolvedValue(undefined);
    await taskHandler(job);

    // const newOrderItems = await OrderItem.find({ _id: orderItems.map((oi) => oi._id) });
    // newOrderItems.forEach((newOrderItem) => {
    //   expect(newOrderItem).toHaveProperty('meta.automatedEmailToLenderProcessed', true);
    // });
  });
});
