require('../../../dotenv');
const LoanController = require('../../../../src/api/controllers/v4/loan.controller');

const loanGroups = [
  {
    loans: [
      [{ netweight: 100, allowRepledgeV2: true, closingamount: 3000 }, { netweight: 0 }],
      [{ netweight: 100, allowRepledgeV2: false }, { netweight: 0 }]],
    type: '1:1',
  },
  {
    loans: [
      [{ netweight: 100, interest: 100 }, { netweight: 0, interest: 10 }],
      [{ netweight: 100, interest: 400 }, { netweight: 0 }]],
    type: '1:1',
  },
  {
    loans: [
      [{ netweight: 100 }, { netweight: 200, closingamount: 1000 },
        { netweight: 300 }, { netweight: 0 }]],
    type: 'N:1',
  },
  {
    loans: [
      [{ netweight: 100, allowRepledgeV2: true }, { netweight: 200, allowRepledgeV2: true },
        { netweight: 300 }, { netweight: 0 }]],
    type: 'N:1',
  },
  {
    loans: [
      [{ netweight: 100, allowRepledgeV2: true }, { netweight: 0 }]],
    type: '1:1',
  },
  {
    loans: [
      [{ netweight: 100, closingamount: 3000 }]],
    type: '1:0',
  }];

describe('loanFilters', () => {
  it('should return loans that are allowed for renewal or LE', () => {
    const expectedLoans = [{
      loans: [[{ netweight: 100, allowRepledgeV2: true, closingamount: 3000 }, { netweight: 0 }]], type: '1:1',
    }, {
      loans: [[{ netweight: 100, allowRepledgeV2: true }, { netweight: 200, allowRepledgeV2: true },
        { netweight: 300 }, { netweight: 0 }]],
      type: 'N:1',
    }, {
      loans: [[{ netweight: 100, allowRepledgeV2: true }, { netweight: 0 }]], type: '1:1',
    }];
    const filterParams = {
      repaymentType: 'repledge',
    };
    const filteredLoanGroups = LoanController.loanFilters(loanGroups, filterParams);
    expect(filteredLoanGroups).toEqual(expectedLoans);
  });

  it('should return loans that are allowed for interest payments', () => {
    const expectedLoans = [{ loans: [[{ netweight: 100, interest: 100 }, { netweight: 0, interest: 10 }], [{ netweight: 100, interest: 400 }, { netweight: 0 }]], type: '1:1' }];
    const filterParams = {
      repaymentType: 'interest',
    };
    const filteredLoanGroups = LoanController.loanFilters(loanGroups, filterParams);
    expect(filteredLoanGroups).toEqual(expectedLoans);
  });

  it('should return loans that are allowed for closure', () => {
    const expectedLoans = [{ loans: [[{ netweight: 100, allowRepledgeV2: true, closingamount: 3000 }, { netweight: 0 }]], type: '1:1' }, { loans: [[{ netweight: 100 }, { netweight: 200, closingamount: 1000 }, { netweight: 300 }, { netweight: 0 }]], type: 'N:1' }, { loans: [[{ netweight: 100, closingamount: 3000 }]], type: '1:0' }];

    const filterParams = {
      repaymentType: 'close_loan',
    };
    const filteredLoanGroups = LoanController.loanFilters(loanGroups, filterParams);
    expect(filteredLoanGroups).toEqual(expectedLoans);
  });

  it('should return loans that are allowed for part payment', () => {
    const expectedLoans = [{ loans: [[{ netweight: 100, allowRepledgeV2: true, closingamount: 3000 }, { netweight: 0 }]], type: '1:1' }, { loans: [[{ netweight: 100 }, { netweight: 200, closingamount: 1000 }, { netweight: 300 }, { netweight: 0 }]], type: 'N:1' }, { loans: [[{ netweight: 100, closingamount: 3000 }]], type: '1:0' }];
    const filterParams = {
      repaymentType: 'part_payment',
    };
    const filteredLoanGroups = LoanController.loanFilters(loanGroups, filterParams);
    expect(filteredLoanGroups).toEqual(expectedLoans);
  });

  it('should return loans that are allowed for part release', () => {
    const filterParams = {
      repaymentType: 'part-release',
    };
    const filteredLoanGroups = LoanController.loanFilters(loanGroups, filterParams);
    expect(filteredLoanGroups).toEqual(loanGroups);
  });

  it('should return all loans when no repaymentType is specified', () => {
    const filterParams = {
      repaymentType: null,
    };
    const filteredLoanGroups = LoanController.loanFilters(loanGroups, filterParams);
    expect(filteredLoanGroups).toEqual(loanGroups);
  });

  it('should throw an error when an unknown filter is passed', () => {
    const filterParams = {
      repaymentType: 'UNKNOWN_FILTER',
    };
    expect(() => LoanController.loanFilters(loanGroups, filterParams)).toThrow('Filter of type [UNKNOWN_FILTER] cannot be applied');
  });
});
