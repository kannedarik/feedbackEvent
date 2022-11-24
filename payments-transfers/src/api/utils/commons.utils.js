const moment = require('moment');
const util = require('util');

let timeout = ms =>
  new Promise(res => setTimeout(res, ms));

module.exports = {
  moment,
  util,
  timeout
}
