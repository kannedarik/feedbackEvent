jest.mock('../../../../../../../api/services/rupeek.service');
jest.mock('../../../../../../../api/services/las.service');
const LASService = require('../../../../../../../api/services/las.service');
const RupeekService = require('../../../../../../../api/services/rupeek.service');
const loanApplicationCreateWorker = require('../../../../../../../api/workers/partrelease/salesforce/loan/application/create.worker');

describe('Worker for creating a loan application by calling LAS service', () => {
  const factory = {
    job: {
      variables: {
        token: 'JBKJFBWRFBWRBFOWBRWRIF',
        leadId: 'VAw6ar-00002930',
        loan_type: 'FRESH',
        loanAmount: 10000,
        rupeekScheme: 'Rupeek scheme',
        rupeekLender: '5cd15360091b0149d4da595d',
        rupeekLenderBranch: '5cc682314c1bbb2023ed9eed',
        reason: 'Fresh Loan For Part Release',
        system_source: 'salesforce',
        rupeek_lender: '5cd15360091b0149d4da595d',
        rupeek_lender_branch: '5cc682314c1bbb2023ed9eed',
        is_co_borrower: false,
        transaction_place_type: 'DOOR_STEP',
        is_part_release_fresh: true,
        partreleaseTransactionId: 12345,
        cityId: 1,
      },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    },
    newLoanApplicationIdResponse: '1705',
    fetchActiveTransactionResponse: {
      loan: {
        iscoborrower: false,
      },
    },
  };

  it('should create a new loan application', async () => {
    const {
      job, job: {
        variables: { token, leadId },
      },
      newLoanApplicationIdResponse,
      fetchActiveTransactionResponse,
    } = factory;

    const data = {
      loan_type: job.variables.loan_type,
      loan_amount: job.variables.loanAmount,
      reason: job.variables.reason,
      city_id: job.variables.cityId,
      system_source: job.variables.system_source,
      master_scheme_id: job.variables.rupeekScheme,
      rupeek_offer: job.variables.loanAmount,
      rupeek_lender: job.variables.rupeek_lender,
      rupeek_lender_branch: job.variables.rupeek_lender_branch,
      is_co_borrower: job.variables.is_co_borrower,
      transaction_place_type: job.variables.transaction_place_type,
      is_part_release_fresh: job.variables.is_part_release_fresh,
    };

    RupeekService.fetchActiveTransaction.mockResolvedValue({ ...fetchActiveTransactionResponse });
    LASService.create.mockResolvedValue({ newLoanApplicationIdResponse });

    await loanApplicationCreateWorker().taskHandler(job);
    expect(RupeekService.fetchActiveTransaction).toHaveBeenCalledWith(token, {
      requestid: 12345,
      cityid: 1,
    });
    expect(LASService.create).toHaveBeenCalledWith(token, leadId, data);
    expect(job.complete).toHaveBeenCalledWith({
      newLoanApplicationId: { newLoanApplicationIdResponse },
      activeTransaction: fetchActiveTransactionResponse,
    });
  });
});
