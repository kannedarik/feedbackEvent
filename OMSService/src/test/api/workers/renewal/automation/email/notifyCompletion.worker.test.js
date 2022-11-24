jest.mock('zeebe-node');
jest.mock('../../../../../../api/services/zeebe.service');

const NotifySuccessWorker = require('../../../../../../api/workers/renewal/automation/email/notifyCompletion.worker');
const ZeebeService = require('../../../../../../api/services/zeebe.service');

const { taskHandler } = NotifySuccessWorker();

describe('Email sent success notification worker', () => {
  let job;

  const branchID = 'branch-id';
  const branchOrderIDs = ['order1', 'order2'];

  beforeEach(() => {
    job = {
      variables: {
        branchID,
        ordersPerBranch: {
          [branchID]: branchOrderIDs,
        },
      },
      customHeaders: {
        automatedLenderEmailSent: 'true',
      },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    };
  });

  it('publishes zeebe message to notify email sent success for every selected order for the branch', async () => {
    await taskHandler(job);

    branchOrderIDs.forEach((orderID) => {
      expect(ZeebeService.publishMessage).toHaveBeenCalledWith(
        orderID,
        'automated_lender_email_notification',
        { automatedLenderEmailSent: true },
      );
    });

    expect(job.complete).toHaveBeenCalled();
  });
});
