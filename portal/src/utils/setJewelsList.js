/* eslint import/no-cycle: [2, { maxDepth: 1 }] */
import store from '@/store';

// function call to set default 'false' in isSelected and isLoanClosure
function setJewelsSelectedFlag(loan, branch) {
  const loanData = loan;
  loanData.branchName = branch.branchName;
  loanData.branchId = branch.branchId;
  loanData.isLoanClosure = false;
  loanData.jewels.map((jewel) => {
    const jewelData = jewel;
    jewelData.isSelected = false;
    return jewelData;
  });
  return loanData;
}
function setDiscrepancy(coreId) {
  let hasDiscrepancy = false;
  const { allLoans } = store.state.loans;
  allLoans.forEach((groupedLoan) => {
    groupedLoan.loans.forEach((item) => {
      item.loans.forEach((loan) => {
        if (+loan.coreid === +coreId) {
          hasDiscrepancy = loan.loanHasDiscrepancy;
        }
      });
    });
  });
  return hasDiscrepancy;
}
// method for assigning the part payment split amount for selected loans
export default function setJewelsList(response) {
  const jewelsList = {
    loans: [],
    selectedLoan: [],
    unSelectedLoan: [],
  };
  response.data.data.forEach((jewels) => {
    jewels.branch.forEach((branch) => {
      jewelsList.branchId = branch.branchId;
      jewelsList.branchName = branch.branchName;
      branch.loans.map((loan) => jewelsList.loans.push(
        setJewelsSelectedFlag(loan, branch),
      ));
      branch.loans.forEach((loan, index) => {
        const loansObject = loan;
        loansObject.hasJewelsSelected = false;
        loansObject.hasDiscrepancy = setDiscrepancy(loansObject.loanId);
        loansObject.hasDisable = false;
        loansObject.lender = jewels.lender;
        loansObject.lenderId = jewels.lenderId;
        if (loan.selected) {
          loansObject.hasShowLenderInfo = !index || !jewelsList.selectedLoan.length;
          jewelsList.selectedLoan.push(loansObject);
        } else {
          loansObject.hasShowLenderInfo = !index || !jewelsList.unSelectedLoan.length;
          jewelsList.unSelectedLoan.push(loansObject);
        }
      });
    });
  });
  return jewelsList;
}
