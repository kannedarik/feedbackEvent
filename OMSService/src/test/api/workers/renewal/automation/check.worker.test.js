jest.mock('zeebe-node');

const RenewalOrder = require('../../../../../api/models/renewalorder.model');
const RenewalOrderFactory = require('../../../../factories/renewalorder.factory');
const RenewalAutomationCheckWorker = require('../../../../../api/workers/renewal/automation/check.worker');

const { taskHandler } = RenewalAutomationCheckWorker();

describe('Renewal automation check worker', () => {
  it('sets the automationState to automated as true if automation is enabled', async () => {
    const order = RenewalOrderFactory.build();
    const updatedOrder = RenewalOrderFactory.build({ automationState: 'automated' });
    const automationChecks = {
      featureFlagEnabled: true,
      doesNotHaveLoanEnhancedLoans: true,
      isInEnabledBranchIDs: true,
      isInEnabledSigningMethods: true,
      isSigningStatusSuccess: true,
      isAutomatedLenderPaymentSettled: true,
    };
    order.checkForOrderAutomation = jest.fn().mockResolvedValue(automationChecks);
    const spy = jest.spyOn(RenewalOrder, 'findOne').mockResolvedValue(order);
    jest.spyOn(RenewalOrder, 'findOneAndUpdate').mockResolvedValue(updatedOrder);
    const job = {
      variables: { orderid: order._id, token: 'foo_token' },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    };
    await taskHandler(job);
    spy.mockRestore();
    expect(order.checkForOrderAutomation).toHaveBeenCalledWith('foo_token');
    expect(job.complete).toHaveBeenCalledWith({ automationState: 'automated', automationChecks });
  });

  it('does not change the automation state if automation is disabled', async () => {
    const order = RenewalOrderFactory.build({ automationState: 'test' });
    const updatedOrder = RenewalOrderFactory.build({ automationState: 'automated' });
    const automationChecks = {
      featureFlagEnabled: true,
      doesNotHaveLoanEnhancedLoans: true,
      isInEnabledBranchIDs: true,
      isInEnabledSigningMethods: true,
      isSigningStatusSuccess: true,
      isAutomatedLenderPaymentSettled: false,
    };
    order.checkForOrderAutomation = jest.fn().mockResolvedValue(automationChecks);
    const spy = jest.spyOn(RenewalOrder, 'findOne').mockResolvedValue(order);
    jest.spyOn(RenewalOrder, 'findOneAndUpdate').mockResolvedValue(updatedOrder);

    const job = {
      variables: { orderid: order._id, token: 'foo_token' },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    };
    await taskHandler(job);

    spy.mockRestore();
    expect(order.checkForOrderAutomation).toHaveBeenCalledWith('foo_token');
    expect(job.complete).toHaveBeenCalledWith({
      automationState: order.automationState,
      automationChecks,
    });
  });
});
