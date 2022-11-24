jest.mock('../../../../../../api/services/notification.service');
jest.mock('../../../../../../api/utils/cache/notification');
const { v4: uuidv4 } = require('uuid');
const NotificationService = require('../../../../../../api/services/notification.service');
const NotificationCache = require('../../../../../../api/utils/cache/notification');
const constants = require('../../../../../../api/utils/constants');
const caseCreationWorker = require('../../../../../../api/workers/partrelease/salesforce/case/create.worker');

describe('Worker to call the Notification service for creating part-release ticket', () => {
  const factory = {
    categoryID: uuidv4(),
    providerID: uuidv4(),
    typeID: uuidv4(),
    processType: constants.caseCreationDetails.partPaymentProcessType,
    productCategory: constants.caseCreationDetails.productCategory,
    oldGL: constants.caseCreationDetails.oldGL,
    job: {
      customHeaders: {
        category: '6069ed7618dd237d93b7aff8',
        type: '6069ed7618dd237d93b7aff8',
        provider: '6069ed7618dd237d93b7aff8',
      },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
      variables: {
        addressLatitude: '13.139898481405474',
        addressLongitude: '80.28212561954342',
        branchId: '5cc682314c1bbb2023ed9eed',
        branchName: 'VV Puram',
        city: 'bangalore',
        cityId: 1,
        customerRupeekId: '60378b864443cd5d369089a3',
        isJewelExport: false,
        leadId: 'WL9kIr-00001806',
        lenderId: '5cd15360091b0149d4da595d',
        lenderName: 'Karur Vysya Bank',
        loanId: 49770,
        loanTransactionId: '605e0fc742ea8aac64c35cb4',
        newLoanAmount: 7607,
        partReleaseWeight: 57,
        pincode: 560085,
        releaseAmountWithCashback: 0,
        secureGL: '258623881179316',
        secureLoanAmount: 100000,
        secureReleaseAmount: 6916,
        suppliedPhone: '8309285250',
        totalWeight: 95,
        unsecureGL: '1048517565764',
        unsecureLoanAmount: 10000,
        unsecureReleaseAmount: 691,
      },
    },
    notificationServiceresponse: {
      code: 200,
      message: 'Notification created successfully',
      notification: '6069ed7618dd237d93b7aff8',
    },
  };

  it('should call Notification Service for creating a case', async () => {
    const {
      job,
      categoryID,
      providerID,
      typeID,
      processType, productCategory, oldGL, job: {
        variables,
      },
      notificationServiceresponse,
    } = factory;

    const payload = {
      category: categoryID,
      provider: providerID,
      type: typeID,
      custom: {
        processType,
        productCategory,
        oldGL,
        ...variables,
      },
    };

    NotificationCache.getCategories.mockResolvedValue(categoryID);
    NotificationCache.getProviders.mockResolvedValue(providerID);
    NotificationCache.getTypes.mockResolvedValue(typeID);

    NotificationService.sendTicket.mockResolvedValue({ ...notificationServiceresponse });
    await caseCreationWorker().taskHandler(job);
    expect(NotificationService.sendTicket).toHaveBeenCalledWith(
      expect.objectContaining({
        ...payload,
      }),
    );
    expect(job.complete).toHaveBeenCalled();
  });
});
