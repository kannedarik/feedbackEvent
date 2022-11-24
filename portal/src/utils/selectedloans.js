// method for changing the active status for selected/unselected loans
export default function selectedLoanChanges(data, loanId) {
  const loansList = JSON.parse(JSON.stringify(data));
  loansList.map((key) => {
    key.loans.map((loan) => {
      const loanData = loan;
      if (loanData.loanid === loanId) {
        loanData.active = !loanData.active;
      }
      return loanData;
    });
    return true;
  });
  return loansList;
}
