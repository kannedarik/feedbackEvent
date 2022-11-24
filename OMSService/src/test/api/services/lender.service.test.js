const RedisClient = require('../../../config/redis');
const LenderService = require('../../../api/services/lender.service');
const BranchFactory = require('../../factories/branch.factory');
const LenderFactory = require('../../factories/lender.factory');
const vars = require('../../../config/vars');

describe('Lender service', () => {
  describe('getLender', () => {
    let lender1;
    let lender2;

    beforeEach(async () => {
      lender1 = LenderFactory.build();
      lender2 = LenderFactory.build();

      await RedisClient.setAsync(
        vars.redis.key.core.lenders, JSON.stringify([lender1, lender2]),
      );
    });

    it('returns the lender details for given lender id', async () => {
      expect(await LenderService.getLender(lender1.id)).toEqual(lender1);
      expect(await LenderService.getLender(lender2.id)).toEqual(lender2);
    });

    it('returns undefined if no lender is found for given lender id', async () => {
      expect(await LenderService.getLender('unknown-id')).toBeUndefined();
    });
  });

  describe('getBranch', () => {
    let branch1;
    let branch2;
    let branch3;

    beforeEach(async () => {
      branch1 = BranchFactory.build({ id: 'test-branch1', branchof: 'foo' });
      branch2 = BranchFactory.build({ id: 'test-branch2', branchof: 'foo' });
      branch3 = BranchFactory.build({ id: 'test-branch3', branchof: 'bar' });

      await RedisClient.setAsync(
        vars.redis.key.core.lenders,
        JSON.stringify([
          LenderFactory.build({ id: 'foo', branches: [branch1, branch2] }),
          LenderFactory.build({ id: 'bar', branches: [branch3] }),
        ]),
      );
    });

    it('returns the branch details for given branch id', async () => {
      expect(await LenderService.getBranch(branch1.id)).toEqual(branch1);
      expect(await LenderService.getBranch(branch2.id)).toEqual(branch2);
      expect(await LenderService.getBranch(branch3.id)).toEqual(branch3);
    });

    it('returns undefined if no branch is found for given branch id', async () => {
      expect(await LenderService.getBranch('unknown-id')).toBeUndefined();
    });
  });
});
