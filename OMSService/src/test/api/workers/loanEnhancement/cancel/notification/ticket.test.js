const Worker = require('../../../../../../api/workers/loanEnhancement/cancel/notification/ticket');
const SupportService = require('../../../../../../api/services/support.service');
const RenewalOrder = require('../../../../../../api/models/renewalorder.model');
const renewalControllerTestData = require('../../../../testdata/renewalorder.testdata');

const { taskHandler } = Worker();

jest.mock('zeebe-node');

jest.mock('../../../../../../api/services/support.service', () => ({
  updateLoanEnhancementStatus: jest.fn().mockResolvedValue(),
}));

describe('Loan Enhancement Salesforce ticket cancellation', () => {
  let job;
  let complete;

  beforeEach(async () => {
    job = {
      variables: { orderid: renewalControllerTestData.mockRenewalUpdateObject._id },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    };
    complete = { success: jest.fn(), failure: jest.fn() };
  });

  it('calls update loanEnhancement status api with le_cancelled as true', async () => {
    jest.spyOn(RenewalOrder, 'findOne').mockResolvedValue(renewalControllerTestData.mockRenewalUpdateObject);
    await taskHandler(job, complete);

    expect(SupportService.updateLoanEnhancementStatus).toBeCalledWith(
      renewalControllerTestData.mockRenewalUpdateObject._id, {
        le_cancelled: true,
        cancellation_reason: renewalControllerTestData.mockRenewalUpdateObject.cancellation_reason,
        cancellation_comment: renewalControllerTestData.mockRenewalUpdateObject.cancellationComment,
      },
    );
  });
});
