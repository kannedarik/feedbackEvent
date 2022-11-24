const DateUtil = require('../../../api/utils/date');

describe('isHoursPassedLessThan', () => {
  it('should return true if hours passed is less than the given hours', () => {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 23);
    expect(DateUtil.isHoursPassedLessThan(startDate.toISOString(), 24)).toEqual(true);
  });

  it('should return false if hours passed is not less than the given hours', () => {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 25);
    expect(DateUtil.isHoursPassedLessThan(startDate.toISOString(), 24)).toEqual(false);
  });
});
