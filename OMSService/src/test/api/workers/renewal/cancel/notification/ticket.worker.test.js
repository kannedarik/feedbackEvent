const Worker = require('../../../../../../api/workers/renewal/cancel/notification/ticket.worker');
const SupportService = require('../../../../../../api/services/support.service');
const RenewalOrder = require('../../../../../../api/models/renewalorder.model');
const renewalControllerTestData = require('../../../../testdata/renewalorder.testdata');

const { taskHandler } = Worker();

jest.mock('zeebe-node');

jest.mock('../../../../../../api/services/support.service', () => ({
  updateSignStatus: jest.fn().mockResolvedValue(),
}));

describe('Renewal Salesforce ticket cancellation', () => {
  let job;

  beforeEach(async () => {
    job = {
      variables: { orderid: renewalControllerTestData.mockRenewalUpdateObject._id },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    };
  });

  it('calls update loanEnhancement status api with le_cancelled as true', async () => {
    jest.spyOn(RenewalOrder, 'findOne').mockResolvedValue(renewalControllerTestData.mockRenewalUpdateObject);
    await taskHandler(job);
    expect(SupportService.updateSignStatus).toBeCalledWith(
      renewalControllerTestData.mockRenewalUpdateObject._id, {
        renewal_cancelled: true,
        cancellation_reason: renewalControllerTestData.mockRenewalUpdateObject.cancellation_reason,
        cancellation_comment: renewalControllerTestData.mockRenewalUpdateObject.cancellationComment,
      },
    );
  });
});
