jest.mock('../../../../../../api/services/notification.service');

const checkNotificationStatusWorker = require('../../../../../../api/workers/renewal/automation/email/checkNotificationStatus.worker');
const notifcationService = require('../../../../../../api/services/notification.service');

const { taskHandler } = checkNotificationStatusWorker();

describe('check notification status of email sent to lender', () => {
  beforeEach(async () => {
    jest.restoreAllMocks();
  });
  it('update emailNotificationSucceeded as true when email sent successfully', async () => {
    notifcationService.notificationDetails.mockResolvedValue({
      notification: {
        status: {
          name: 'success',
        },
      },
    });
    const job = {
      variables: {
        notificationId: 'asdgffg',
        retryCount: 0,
      },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    };
    await taskHandler(job);
    expect(job.complete).toHaveBeenCalledWith({
      emailNotificationSucceeded: true,
      retryCount: 1,
    });
    expect(notifcationService.notificationDetails).toHaveBeenCalledWith('asdgffg');
  });

  it('update emailNotificationSucceeded as false with increment in retrycount when email sent fails', async () => {
    notifcationService.notificationDetails.mockResolvedValue({
      notification: {
        status: {
          name: 'failure',
        },
      },
    });
    const job = {
      variables: {
        notificationId: 'asdgffg',
        retryCount: 0,
      },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    };
    await taskHandler(job);
    expect(job.complete).toHaveBeenCalledWith({
      emailNotificationSucceeded: false,
      retryCount: 1,
    });
    expect(notifcationService.notificationDetails).toHaveBeenCalledWith('asdgffg');
  });

  it('update emailNotificationSucceeded as false with increment in retrycount when email sent method throws any exception', async () => {
    notifcationService.notificationDetails
      .mockImplementation(() => { throw new Error('Some error occurred while calling notification service'); });
    const job = {
      variables: {
        notificationId: 'asdgffg',
        retryCount: 0,
      },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    };
    await taskHandler(job);
    expect(job.complete).toHaveBeenCalledWith({
      emailNotificationSucceeded: false,
      retryCount: 1,
    });
    expect(notifcationService.notificationDetails).toHaveBeenCalledWith('asdgffg');
  });
});
