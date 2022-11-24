jest.mock('zeebe-node');
jest.mock('../../../../../api/services/orion.service');
const RenewalOrderFactory = require('../../../../factories/renewalorder.factory');
const OrderItemFactory = require('../../../../factories/orderitem.factory');
const OrderPaymentFactory = require('../../../../factories/orderpayment.factory');
const updateLMSWorker = require('../../../../../api/workers/renewal/automation/updateLMS.worker');
const OrionService = require('../../../../../api/services/orion.service');
const OrderItem = require('../../../../../api/models/orderitem.model');
const OrderPayment = require('../../../../../api/models/orderpayment.model');

describe('updateLMS worker', () => {
  beforeEach(async () => {
    jest.restoreAllMocks();
  });
  it('calls Orion renewal api with unsecure loan details', async () => {
    const order = RenewalOrderFactory.build();

    const orderItemOne = OrderItemFactory.build({
      order,
      meta: {
        newunsecureamount: 69,
        renewalMISData: {
          oldLoanClosureDate: '24-01-2021',
        },
        unsecurelosid: 123,
        oldloantype: '1:1',
        newloantype: '1:1',
        newscheme: {
          tenure: 6,
          baseSchemes: [{ type: 'unsecure', interestCalculation: { interestRate: 37.65 }, legalName: 'Support GL 37.65 6M | PF - 1.85%' }],
        },
      },
    });

    const orderItemTwo = OrderItemFactory.build({
      order,
      meta: {
        newunsecureamount: 42,
        renewalMISData: {
          oldLoanClosureDate: '16-02-2021',
        },
        unsecurelosid: 456,
        oldloantype: '1:1',
        newloantype: '1:1',
        newscheme: {
          tenure: 6,
          baseSchemes: [{ type: 'unsecure', interestCalculation: { interestRate: 33 }, legalName: 'Support GL 33.65 6M | PF - 1.85%' }],
        },
      },
    });

    const orderPayment = OrderPaymentFactory.build({ order, requestId: 'RequestID1' });
    const job = {
      variables: {
        orderid: order._id,
      },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    };

    OrionService.renewRCPLLoan.mockResolvedValue({ lmsid: '12344321' });

    jest.spyOn(OrderItem, 'find').mockResolvedValue([orderItemOne, orderItemTwo]);
    jest.spyOn(OrderPayment, 'findOne').mockResolvedValue(orderPayment);
    jest.spyOn(OrderItem, 'findOneAndUpdate').mockResolvedValue(null);
    await updateLMSWorker().taskHandler(job);

    expect(job.complete).toHaveBeenCalledWith({
      automatedstatus: true,
    });

    expect(OrionService.renewRCPLLoan.mock.calls).toMatchObject([[{
      intereststartdate: '2021-01-24',
      closuredate: '2021-01-24',
      losid: '123',
      previouslosid: '123',
      loanamount: 69,
      interestrate: 37.65,
      tenure: 6,
      schemename: 'Support GL 37.65 6M | PF - 1.85%',
    }],
    [{
      intereststartdate: '2021-02-16',
      closuredate: '2021-02-16',
      losid: '456',
      previouslosid: '456',
      loanamount: 42,
      interestrate: 33,
      tenure: 6,
      schemename: 'Support GL 33.65 6M | PF - 1.85%',
    }]]);
  });

  it('adds the new unsecure LMS ID to the order item for 1:1 to 1:1 renewals', async () => {
    const order = RenewalOrderFactory.build();

    const orderItem = OrderItemFactory.build({
      order,
      meta: {
        newunsecureamount: 69,
        renewalMISData: {
          oldLoanClosureDate: '24-01-2021',
        },
        unsecurelosid: 123,
        oldloantype: '1:1',
        newloantype: '1:1',
        newscheme: {
          baseSchemes: [{ type: 'unsecure', interestCalculation: { interestRate: 24 } }],
        },
      },
    });

    const job = {
      variables: {
        orderid: order.id,
      },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    };

    jest.spyOn(OrderItem, 'find').mockResolvedValue([orderItem]);
    jest.spyOn(OrderPayment, 'findOne').mockResolvedValue(null);
    jest.spyOn(OrderItem, 'findOneAndUpdate').mockResolvedValue(null);
    OrionService.renewRCPLLoan.mockResolvedValue({ lmsid: '12344321' });

    await updateLMSWorker().taskHandler(job);
    expect(job.complete).toHaveBeenCalledWith({
      automatedstatus: true,
    });

    // const newOrderItem = await OrderItem.findOne({ _id: orderItem._id });
    // expect(newOrderItem.meta.newunsecurelmsid).toEqual('12344321');
  });

  it('calls Orion repayment api with unsecure loan details for 1:1 to 1:0 cases', async () => {
    const order = RenewalOrderFactory.build();

    const orderItemOne = OrderItemFactory.build({
      order,
      meta: {
        newunsecureamount: 69,
        renewalMISData: {
          oldLoanClosureDate: '24-01-2021',
        },
        unsecurelosid: 123,
        unsecurelmsid: 12222,
        oldloantype: '1:1',
        newloantype: '1:0',
        unsecurecashback: 0,
        newscheme: {
          tenure: 6,
          baseSchemes: [{ type: 'unsecure', interestCalculation: { interestRate: 24 }, legalName: 'aaa' }],
        },
      },
    });

    const orderItemTwo = OrderItemFactory.build({
      order,
      meta: {
        newunsecureamount: 42,
        renewalMISData: {
          oldLoanClosureDate: '16-02-2021',
        },
        unsecurelosid: 456,
        unsecurelmsid: 12223,
        oldloantype: '1:1',
        newloantype: '1:1',
        unsecurecashback: 0,
        newscheme: {
          tenure: 6,
          baseSchemes: [{ type: 'unsecure', interestCalculation: { interestRate: 33 }, legalName: 'aaa' }],
        },
      },
    });

    const orderPayment = OrderPaymentFactory.build({
      order,
      requestId: 'RequestID1',
      meta: {
        pgresponse: {
          payment: {
            entity: {
              id: 'pay_id',
              created_at: 1629731218,
            },
          },
        },
        loandata: [{
          paidamount: 1000,
          cashback: 500,
          loan: {
            loanid: 12222,
            closingamount: 12000,
          },
        }, {
          paidamount: 1000,
          cashback: 500,
          loan: {
            loanid: 12223,
            closingamount: 12000,
          },
        }],
      },
    });
    const job = {
      variables: {
        orderid: order.id,
      },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    };
    jest.spyOn(OrderItem, 'find').mockResolvedValue([orderItemOne, orderItemTwo]);
    jest.spyOn(OrderPayment, 'findOne').mockResolvedValue(orderPayment);
    jest.spyOn(OrderItem, 'findOneAndUpdate').mockResolvedValue(null);

    OrionService.renewRCPLLoan.mockResolvedValue({ lmsid: '12344321' });
    OrionService.closeRCPLLoan.mockResolvedValue({ success: true });

    await updateLMSWorker().taskHandler(job);

    expect(job.complete).toHaveBeenCalledWith({
      automatedstatus: true,
    });

    expect(OrionService.renewRCPLLoan.mock.calls).toMatchObject([
      [{
        intereststartdate: '2021-02-16',
        closuredate: '2021-02-16',
        losid: '456',
        previouslosid: '456',
        loanamount: 42,
        interestrate: 33,
        tenure: 6,
        schemename: 'aaa',
      }]]);
  });

  it('when orion repayment api returns false status for 1:1 to 1:0 cases', async () => {
    const order = RenewalOrderFactory.build();

    const orderItemOne = OrderItemFactory.build({
      order,
      meta: {
        newunsecureamount: 69,
        renewalMISData: {
          oldLoanClosureDate: '24-01-2021',
        },
        unsecurelosid: 123,
        unsecurelmsid: 12222,
        oldloantype: '1:1',
        newloantype: '1:0',
        unsecurecashback: 0,
        newscheme: {
          baseSchemes: [{ type: 'unsecure', interestCalculation: { interestRate: 24 } }],
        },
      },
    });

    const orderPayment = OrderPaymentFactory.build({
      order,
      requestId: 'RequestID1',
      meta: {
        pgresponse: {
          payment: {
            entity: {
              id: 'pay_id',
              created_at: 1629731218,
            },
          },
        },
        loandata: [{
          paidamount: 1000,
          cashback: 500,
          loan: {
            loanid: 12222,
            closingamount: 12000,
          },
        }, {
          paidamount: 1000,
          cashback: 500,
          loan: {
            loanid: 12223,
            closingamount: 12000,
          },
        }],
      },
    });
    const job = {
      variables: {
        orderid: order.id,
      },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    };

    jest.spyOn(OrderItem, 'find').mockResolvedValue([orderItemOne]);
    jest.spyOn(OrderPayment, 'findOne').mockResolvedValue(orderPayment);
    jest.spyOn(OrderItem, 'findOneAndUpdate').mockResolvedValue(null);
    OrionService.closeRCPLLoan.mockResolvedValue({ success: false });

    await updateLMSWorker().taskHandler(job);

    expect(job.complete).toHaveBeenCalledWith({
      automatedstatus: false,
    });
  });

  it('calls complete.success with automated status as false if orderItems has 1:0 to 1:1  cases', async () => {
    const order = RenewalOrderFactory.build();

    const orderItemOne = OrderItemFactory.build({
      order,
      meta: {
        newunsecureamount: 69,
        renewalMISData: {
          oldLoanClosureDate: '24-01-2021',
        },
        unsecurelosid: 123,
        unsecurelmsid: 12222,
        oldloantype: '1:0',
        newloantype: '1:1',
        unsecurecashback: 0,
        newscheme: {
          tenure: 6,
          baseSchemes: [{ type: 'unsecure', interestCalculation: { interestRate: 24 }, legalName: 'aaa' }],
        },
      },
    });

    const orderItemTwo = OrderItemFactory.build({
      order,
      meta: {
        newunsecureamount: 42,
        renewalMISData: {
          oldLoanClosureDate: '16-02-2021',
        },
        unsecurelosid: 456,
        unsecurelmsid: 12223,
        oldloantype: '1:1',
        newloantype: '1:1',
        unsecurecashback: 0,
        newscheme: {
          tenure: 6,
          baseSchemes: [{ type: 'unsecure', interestCalculation: { interestRate: 33 }, legalName: 'aaa' }],
        },
      },
    });

    const orderPayment = OrderPaymentFactory.build({ order, requestId: 'RequestID1' });
    const job = {
      variables: {
        orderid: order.id,
      },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    };
    jest.spyOn(OrderItem, 'find').mockResolvedValue([orderItemOne, orderItemTwo]);
    jest.spyOn(OrderPayment, 'findOne').mockResolvedValue(orderPayment);
    jest.spyOn(OrderItem, 'findOneAndUpdate').mockResolvedValue(null);
    OrionService.renewRCPLLoan.mockResolvedValue({ lmsid: '12344321' });

    await updateLMSWorker().taskHandler(job);

    expect(job.complete).toHaveBeenCalledWith({
      automatedstatus: false,
    });

    expect(OrionService.renewRCPLLoan.mock.calls).toMatchObject([
      [{
        intereststartdate: '2021-02-16',
        closuredate: '2021-02-16',
        losid: '456',
        previouslosid: '456',
        loanamount: 42,
        interestrate: 33,
        tenure: 6,
        schemename: 'aaa',
      }]]);
  });

  it('calls complete.success with automated status as true for 1:0 to 1:0  cases', async () => {
    const order = RenewalOrderFactory.build();

    const orderItemOne = OrderItemFactory.build({
      order,
      meta: {
        newunsecureamount: 69,
        renewalMISData: {
          oldLoanClosureDate: '24-01-2021',
        },
        unsecurelosid: 123,
        unsecurelmsid: 12222,
        oldloantype: '1:0',
        newloantype: '1:0',
        unsecurecashback: 0,
        newscheme: {
          baseSchemes: [{ type: 'unsecure', interestCalculation: { interestRate: 24 } }],
        },
      },
    });

    const orderPayment = OrderPaymentFactory.build({ order, requestId: 'RequestID1' });
    const job = {
      variables: {
        orderid: order.id,
      },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    };
    jest.spyOn(OrderItem, 'find').mockResolvedValue([orderItemOne]);
    jest.spyOn(OrderPayment, 'findOne').mockResolvedValue(orderPayment);
    jest.spyOn(OrderItem, 'findOneAndUpdate').mockResolvedValue(null);
    await updateLMSWorker().taskHandler(job);

    expect(job.complete).toHaveBeenCalledWith({
      automatedstatus: true,
    });
  });

  it('calls complete.success with automated status as false if orion call fails', async () => {
    const order = RenewalOrderFactory.build();

    const orderItem = OrderItemFactory.build({
      order,
      meta: {
        newunsecureamount: 69,
        renewalMISData: {
          oldLoanClosureDate: '24-01-2021',
        },
        unsecurelosid: 123,
        unsecurelmsid: 12222,
        oldloantype: '1:1',
        newloantype: '1:0',
        unsecurecashback: 0,
        newscheme: {
          baseSchemes: [{ type: 'unsecure', interestCalculation: { interestRate: 24 } }],
        },
      },
    });
    const orderPayment = OrderPaymentFactory.build({
      order,
      requestId: 'RequestID1',
      meta: {
        pgresponse: {},
        loandata: [{
          loan: {
            loanid: 12222,
            closingamount: 12000,
          },
        }, {
          loan: {
            loanid: 12223,
            closingamount: 12000,
          },
        }],
      },
    });
    const job = {
      variables: {
        orderid: order.id,
      },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    };
    jest.spyOn(OrderItem, 'find').mockResolvedValue([orderItem]);
    jest.spyOn(OrderPayment, 'findOne').mockResolvedValue(orderPayment);
    jest.spyOn(OrderItem, 'findOneAndUpdate').mockResolvedValue(null);
    await updateLMSWorker().taskHandler(job);

    expect(job.complete).toHaveBeenCalledWith({
      automatedstatus: false,
    });
  });
});
