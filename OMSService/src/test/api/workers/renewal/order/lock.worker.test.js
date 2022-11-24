jest.mock('zeebe-node');
jest.mock('../../../../../api/utils/cache/docsign');

const Worker = require('../../../../../api/workers/renewal/order/lock.worker');
const RenewalOrder = require('../../../../../api/models/renewalorder.model');
const DocSignCache = require('../../../../../api/utils/cache/docsign');
const renewalControllerTestData = require('../../../testdata/renewalorder.testdata');

describe('Update order lock status worker', () => {
  it('updates order with lock related signing information from job variables', async () => {
    DocSignCache.getTypes.mockResolvedValue([{ id: '12345', name: 'foo' }]);
    const job = {
      variables: {
        orderid: renewalControllerTestData.mockRenewalLockObject._id,
        signingmethod: 'foo',
        signingstatus: 'pending',
        locksign: true,
      },
      complete: jest.fn(),
      fail: jest.fn(),
      error: jest.fn(),
    };
    jest.spyOn(RenewalOrder, 'findOne').mockResolvedValue(renewalControllerTestData.mockRenewalLockObject);
    await Worker().taskHandler(job);
    expect(job.complete).toBeCalled();
  });
});
