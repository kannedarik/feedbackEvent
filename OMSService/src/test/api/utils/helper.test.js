const helper = require('../../../api/utils/helper');

describe('isSuperset', () => {
  it('returns true when all elements in the subarray are contained in the first array', () => {
    expect(helper.isSuperset(['foo', 'bar'], ['foo'])).toEqual(true);
    expect(helper.isSuperset(['foo'], ['foo'])).toEqual(true);
    expect(helper.isSuperset([], [])).toEqual(true);
    expect(helper.isSuperset(['foo', 'bar'], [])).toEqual(true);
  });

  it('returns false when some elements in the subarray are missing from the first array', () => {
    expect(helper.isSuperset(['foo', 'bar'], ['baz'])).toEqual(false);
    expect(helper.isSuperset(['foo'], ['baz'])).toEqual(false);
  });
});
