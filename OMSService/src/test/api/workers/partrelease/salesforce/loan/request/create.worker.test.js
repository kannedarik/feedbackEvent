jest.mock('../../../../../../../api/services/rupeek.service');
const RupeekService = require('../../../../../../../api/services/rupeek.service');
const loanRequestCreateWorker = require('../../../../../../../api/workers/partrelease/salesforce/loan/request/create.worker');

describe('Worker for creating a loan request by calling rupeek-web service', () => {
  const factory = {
    job: {
      variables: {
        token: '',
        phone: '',
        address: '3434, Phase 2, Whitefield, dfdf, undefined, Whitefield, Bangalore-560005',
        category: 'other',
        rupeekLender: '5cd15360091b0149d4da595d',
        rupeekLenderBranch: '5cc682314c1bbb2023ed9eed',
        newLoanApplicationId: 1704,
        loanAmount: '20000.00',
        timeslotstart: 1617608700,
        timeslotend: 1617615000,
        cityId: 1,
        location: { y: '77.743241', x: '12.961757' },
        isscheduled: true,
        istakeover: false,
        rupeekScheme: 'KN49GNKR',
        isinternaltakeover: false,
        city: 'Bangalore',
        is_part_release_fresh: true,
        partreleaseTransactionId: '605e0fc742ea8aac64c35cb4',
        notes: 'unit testing',
      },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    },
    createLoanRequestResponse: {
      referencenumber: 'or2ydc',
      requestid: '6065ac8c75cd96134420a89a',
      UserMsg: 'A new request has been created successfully',
      status: 200,
    },
  };

  it('should create a new loan request', async () => {
    const {
      job, job: {
        variables: { token },
      },
      createLoanRequestResponse,
    } = factory;
    const data = {
      phone: job.variables.phone,
      address: job.variables.address,
      category: job.variables.category,
      lpid: job.variables.rupeekLender,
      loanapplicationid: job.variables.newLoanApplicationId,
      requestedamount: job.variables.loanAmount,
      timeslotstart: job.variables.timeslotstart,
      timeslotend: job.variables.timeslotend,
      cityid: job.variables.cityId,
      location: job.variables.location,
      isscheduled: job.variables.isscheduled,
      istakeover: job.variables.istakeover,
      branchid: job.variables.rupeekLenderBranch,
      masterschemeid: job.variables.rupeekScheme,
      isinternaltakeover: job.variables.isinternaltakeover,
      city: job.variables.city,
      is_part_release_fresh: job.variables.is_part_release_fresh,
      parentpartreleasetransaction: job.variables.partreleaseTransactionId,
      exceptionnotes: job.variables.notes,
    };
    RupeekService.createLoanRequest.mockResolvedValue({ ...createLoanRequestResponse });
    await loanRequestCreateWorker().taskHandler(job);
    expect(RupeekService.createLoanRequest).toHaveBeenCalledWith(token, data);
    expect(job.complete).toHaveBeenCalledWith({
      newloanrequest: { ...createLoanRequestResponse },
    });
  });
});
