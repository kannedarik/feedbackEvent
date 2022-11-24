jest.mock('../../../../../../api/services/core.service');
jest.mock('../../../../../../api/services/payment.service');
const CoreService = require('../../../../../../api/services/core.service');
const PaymentService = require('../../../../../../api/services/payment.service');
const loanDetailsWorker = require('../../../../../../api/workers/partrelease/salesforce/loan/details.worker');

describe('Worker for fetching loan details from Core anf Payments DB', () => {
  const factory = {
    job: {
      variables: {
        loanId: 123456,
        isJewelExport: false,
        secureGL: '123456789',
        unsecureGL: '104098765',
      },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    },
    coreServiceResponse: {
      UserMsg: 'Fetched LoanRequest Details Successfully',
      loanRequestData: {
        id: '605e0fc742ea8aac64c35cb4',
        lenderId: '5cd15360091b0149d4da595d',
        lenderName: 'Karur Vysya Bank',
        branchId: '5cc682314c1bbb2023ed9eed',
        branchName: 'VV Puram',
        cityId: 1,
        city: 'bangalore',
        leadId: 'WL9kIr-00001806',
        customerId: '60378b864443cd5d369089a3',
        customerPhone: 8309285250,
        addressLatitude: 13.139898481405474,
        addressLongitude: 80.28212561954342,
        pincode: '600081',
        appraisalEligibleWT: 800,
      },
      status: 200,
    },
    paymentServiceResponse: {
      loans: [
        {
          loanid: '104098765',
          closingamount: 100,
        },
        {
          loanid: '123456789',
          closingamount: 802000,
        },
      ],
    },
    workerResponse: {
      addressLatitude: 13.139898481405474,
      addressLongitude: 80.28212561954342,
      branchId: '5cc682314c1bbb2023ed9eed',
      branchName: 'VV Puram',
      city: 'bangalore',
      cityId: 1,
      customerRupeekId: '60378b864443cd5d369089a3',
      isCityLaunched: true,
      leadId: 'WL9kIr-00001806',
      lenderId: '5cd15360091b0149d4da595d',
      lenderName: 'Karur Vysya Bank',
      loanTransactionId: '605e0fc742ea8aac64c35cb4',
      pincode: '600081',
      secureReleaseAmount: 802000,
      suppliedPhone: 8309285250,
    },
  };

  it('should call Core Service and Paymnets Service for fetching the loan Details', async () => {
    const {
      job,
      coreServiceResponse,
      paymentServiceResponse,
      workerResponse,
    } = factory;

    CoreService.loanrequests.mockResolvedValue({ ...coreServiceResponse });
    PaymentService.fetchLoanPaymentData.mockResolvedValue({ ...paymentServiceResponse });
    await loanDetailsWorker().taskHandler(job);

    expect(CoreService.loanrequests).toHaveBeenCalledWith({
      loanids: job.variables.loanId,
    });
    expect(PaymentService.fetchLoanPaymentData).toHaveBeenCalledWith({ loanids: `${job.variables.secureGL},${job.variables.unsecureGL}` });
    expect(job.complete).toHaveBeenCalledWith({ ...workerResponse });
  });
});
