const _ = require('lodash');

const build = (options) => _.merge({
  type: 'misrecord',
  data: {
    accuredpenalinterest: null,
    alternatephone: '+91 9876543210',
    amountrpa: null,
    appraisedamount: null,
    bankloanamount: null,
    branchid: 571,
    branchname: 'PALAM - NEWDELHI',
    closingamount: '225401',
    createdAt: '05-08-2020',
    custid: 500000001,
    custname: 'DEEPAK KUMAR',
    duedays: '1',
    expirydate: '05-02-2021',
    grossweight: '74.3',
    id: 706,
    interestamount: '9135.781',
    interestrate: '19.76',
    lenderid: 'icici',
    loanid: '057105002412',
    misfileid: 93,
    netweight: '74.3',
    outstandingbalance: '222822',
    penalamount: '0',
    primaryphone: '',
    principalbalance: null,
    query: null,
    renewaldate: null,
    renewalflag: null,
    repledgeamount: null,
    sanctiondate: '05-08-2020',
    sanctionedamount: '216266',
    schemename: null,
    status: 'Active',
    tenure: '6',
    totaloutstanding: null,
    unbilledinterest: null,
    updatedAt: '05-08-2020',
    isnewopenedloan: false,
    isnewclosedloan: false,
  },
}, options);

module.exports = { build };
