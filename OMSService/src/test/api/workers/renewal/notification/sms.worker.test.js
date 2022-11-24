/* eslint-disable no-undef */
jest.mock('zeebe-node');

jest.mock('../../../../../api/utils/notification/sms');
jest.mock('../../../../../api/utils/cache/notification');
jest.mock('../../../../../api/services/notification.service');
jest.mock('../../../../../api/utils/cache/core');
jest.mock('../../../../../api/utils/error');

const smsWorker = require('../../../../../api/workers/renewal/notification/sms.worker');
const notifcationService = require('../../../../../api/services/notification.service');
const notificationCache = require('../../../../../api/utils/cache/notification');
// const smsUtils = require('../../../../../api/utils/notification/sms');
const coreCache = require('../../../../../api/utils/cache/core');
const ErrorHandler = require('../../../../../api/utils/error');
const smsUtils = require('../../../../../api/utils/notification/sms');

const RenewalOrderFactory = require('../../../../factories/renewalorder.factory');
const OrderItemFactory = require('../../../../factories/orderitem.factory');
const OrderItem = require('../../../../../api/models/orderitem.model');

const { taskHandler } = smsWorker();

describe('SEND SMS', () => {
  beforeEach(async () => {
    jest.restoreAllMocks();
  });
  it('if signing status is success send signed pledge card and loan declaration sms to customers', async (done) => {
    const order = RenewalOrderFactory.build();
    const job = {
      variables: {
        orderid: order._id,
        customer: {
          id: '122',
          name: 'dj',
        },
        phone: '2122',
        cityid: 1,
        signingstatus: 'success',
        shortlinks: ['1111'],
      },
      customHeaders: {
        category: '11',
        provider: '12',
        type: '22',
        template: '23',
      },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    };
    const orderItem = OrderItemFactory.build({
      order,
      meta: {
        newlmsid: '123',
        newsecureamount: 42000,
        newunsecureamount: 1000,
        newunsecurelmsid: '321',
        newloantype: '1:1',
      },
    });
    jest.spyOn(OrderItem, 'find').mockResolvedValue([orderItem]);
    notificationCache.getCategories.mockResolvedValue('abc');
    notificationCache.getProviders.mockResolvedValueOnce('bcd');
    notificationCache.getTypes.mockResolvedValue('cde');
    notificationCache.getTemplates.mockResolvedValue('def');
    notificationCache.getProviders.mockResolvedValueOnce('efg');
    coreCache.getCities.mockResolvedValue('fgh');
    notifcationService.sendSMS.mockResolvedValue({});
    smsUtils.loanAmountDeclarationSMSTemplate.mockResolvedValue({ id: 1, data: { a: 1 } });
    smsUtils.loanInterestDeclarationSMSTemplate.mockResolvedValue({ id: 2, data: { a: 2 } });
    await taskHandler(job);
    expect(notifcationService.sendSMS).toHaveBeenCalledTimes(1);
    const args = notifcationService.sendSMS.mock.calls[0][0];
    expect(args).toMatchObject({
      category: 'abc',
      provider: 'bcd',
      type: 'cde',
      template: {
        data: {
          name: 'dj',
          supportnumber: 'fgh',
          url: '1111',
        },
      },
    });
    expect(job.complete).toHaveBeenCalled();
    done();
  });

  it('create incident if pledge card sms fails', async (done) => {
    const order = RenewalOrderFactory.build();
    const job = {
      variables: {
        orderid: order._id,
        customer: {
          id: '122',
          name: 'dj',
        },
        phone: '2122',
        cityid: 1,
        signingstatus: 'success',
        shortlinks: ['1111'],
      },
      customHeaders: {
        category: '11',
        provider: '12',
        type: '22',
        template: '23',
      },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    };
    const orderItem = OrderItemFactory.build({
      order,
      meta: {
        newlmsid: '123',
        newsecureamount: 42000,
        newunsecureamount: 1000,
        newunsecurelmsid: '321',
        newloantype: '1:1',
      },
    });
    jest.spyOn(OrderItem, 'find').mockResolvedValue([orderItem]);
    notificationCache.getCategories.mockResolvedValue('abc');
    notificationCache.getProviders.mockResolvedValueOnce('bcd');
    notificationCache.getTypes.mockResolvedValue('cde');
    notificationCache.getTemplates.mockResolvedValue('def');
    notificationCache.getProviders.mockResolvedValueOnce('efg');
    coreCache.getCities.mockResolvedValue('fgh');
    notifcationService.sendSMS.mockImplementation(() => {
      throw new Error('send sms failed');
    });
    ErrorHandler.captureWFError.mockResolvedValue({});
    await taskHandler(job);
    expect(job.fail).toHaveBeenCalled();
    done();
  });
});
