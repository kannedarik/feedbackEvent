const _ = require('lodash');
const BranchFactory = require('./branch.factory');

const build = (options) => _.merge({
  id: 'test-lenderid',
  name: 'South Indian Bank',
  slug: 'sib',
  branches: _.get(options, 'branches') || [BranchFactory.build()],
}, options);

module.exports = { build };
