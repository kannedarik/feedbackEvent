jest.mock('zeebe-node');
jest.mock('../../../../../api/services/support.service');
const RenewalOrderFactory = require('../../../../factories/renewalorder.factory');
const OrderItemFactory = require('../../../../factories/orderitem.factory');
const SupportService = require('../../../../../api/services/support.service');
const updateGLDetailsWorker = require('../../../../../api/workers/renewal/automation/updateGLDetails.worker');
const OrderItem = require('../../../../../api/models/orderitem.model');

describe('updateGLDetails worker', () => {
  it('calls support service with details from the order item', async () => {
    const order = RenewalOrderFactory.build();
    const job = {
      variables: {
        orderid: order._id,
      },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    };

    const orderItemOne = OrderItemFactory.build({
      order,
      meta: {
        newlmsid: '123',
        newsecureamount: 42000,
        newunsecureamount: 1000,
        newunsecurelmsid: '321',
        newloantype: '1:1',
        renewalMISData: {
          isOpenedMISValid: true,
          isClosedMISValid: true,
          newLoanSanctionDate: '28-07-2021',
          oldLoanClosureDate: '28-07-2021',
        },
      },
    });
    const orderItemTwo = OrderItemFactory.build({
      order,
      meta: {
        newlmsid: '456',
        newsecureamount: 69000,
        newloantype: '1:0',
        renewalMISData: {
          isOpenedMISValid: true,
          isClosedMISValid: true,
          newLoanSanctionDate: '25-07-2021',
          oldLoanClosureDate: '25-07-2021',
        },
      },
    });
    const orderItemThree = OrderItemFactory.build({
      order,
      meta: {
        newlmsid: '786',
        newsecureamount: 87000,
        newloantype: '1:1',
        newunsecureamount: 87000,
        renewalMISData: {
          isOpenedMISValid: true,
          isClosedMISValid: true,
          newLoanSanctionDate: '29-07-2021',
          oldLoanClosureDate: '29-07-2021',
        },
      },
    });
    jest.spyOn(OrderItem, 'find').mockResolvedValue([orderItemOne, orderItemTwo, orderItemThree]);
    await updateGLDetailsWorker().taskHandler(job);

    expect(SupportService.createGeneralLedger).toHaveBeenCalledWith(order._id, [
      {
        securedLMSID: '123',
        unsecuredLMSID: '321',
        securedLoanAmount: 42000,
        unsecuredLoanAmount: 1000,
        newGlBookingDate: '28/07/2021',
        oldGLClosedDate: '28/07/2021',
      },
      {
        securedLMSID: '456',
        unsecuredLMSID: null,
        securedLoanAmount: 69000,
        unsecuredLoanAmount: null,
        newGlBookingDate: '25/07/2021',
        oldGLClosedDate: '25/07/2021',
      },
      {
        securedLMSID: '786',
        unsecuredLMSID: null,
        securedLoanAmount: 87000,
        unsecuredLoanAmount: null,
        newGlBookingDate: '29/07/2021',
        oldGLClosedDate: '29/07/2021',
      },
    ]);
    expect(SupportService.updateSignStatus).toHaveBeenCalledWith(order._id, {
      renewal_by_lender_completed: true,
    });
    expect(job.complete).toHaveBeenCalled();
  });
});
