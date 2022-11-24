const moment = require('moment');

module.exports = {
  /**
   * Given a start date and number of hours returns true if
   * current time is within `hours` less than `startDate`
   * @param {ISODate} startDate
   * @param {number} hours
   * @returns {boolean}
   */
  isHoursPassedLessThan: (startDate, hours) => moment().diff(moment(startDate), 'hours') < hours,
};
