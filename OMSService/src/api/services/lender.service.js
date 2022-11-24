const _ = require('lodash');
const { getLenders } = require('../utils/cache/core');

const getLender = async (lenderID) => {
  const lenderExists = (lender) => lender.id === lenderID;
  const lender = await getLenders(lenderExists, 'array');
  return _.get(lender, '[0]');
};

const getBranch = async (branchID) => {
  const branchExists = (branch) => branch.id === branchID;
  const lender = await getLenders((l) => _.find(l.branches, branchExists), 'array');
  return _.chain(lender)
    .get('[0].branches')
    .find(branchExists)
    .value();
};

module.exports = {
  getBranch,
  getLender,
};
