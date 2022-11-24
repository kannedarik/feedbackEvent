jest.mock('../../../../../api/services/support.service');
const SupportService = require('../../../../../api/services/support.service');
const notifyWorker = require('../../../../../api/workers/partrelease/salesforce/notify.worker');

describe('Worker for notifying salesforce about slot confirmation by calling Support service', () => {
  const factory = {
    job: {
      variables: {
        token: '',
        freshLoanId: '60643a64acc678fa62579eee',
        cityId: 1,
        isPISlot: false,
        isRelatedLoan: false,
        isRescheduling: false,
        loans: ['12345'],
        partreleaseTransactionId: '60643a64acc678fa62579eee',
        caseRecordType: 'part-release',
        productCategory: 'Gold Loan',
        newloanrequest: {
          requestid: '60643a64acc678fa62579eee',
        },
      },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    },
    response: {
      UserMsg: 'Notified Succcessfully',
      status: 200,
    },
  };

  it('should call supoort service', async () => {
    const { job, response } = factory;
    const {
      partreleaseTransactionId, loans, isRelatedLoan, caseRecordType, newloanrequest,
    } = job.variables;
    const data = {
      isSlotConfirmed: true,
      loanId: parseInt(loans[0], 10),
      transactionId: partreleaseTransactionId,
      isRelatedLoan,
      caseRecordType,
      freshLoanTransactionId: newloanrequest.requestid,
    };

    SupportService.notifyOnSlotConfirmation.mockResolvedValue({ ...response });
    await notifyWorker().taskHandler(job);
    expect(SupportService.notifyOnSlotConfirmation).toHaveBeenCalledWith(data);
    expect(job.complete).toHaveBeenCalled();
  });
});
