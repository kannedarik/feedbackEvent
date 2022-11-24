const { ZBClient } = require('zeebe-node');
const vars = require('../config/vars');

const zbc = new ZBClient(`${vars.services.zeebe.endpoint}:${vars.services.zeebe.port}`);

module.exports = zbc;
