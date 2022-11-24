//  method for assigning the part payment split amount for selected loans
export default function partPaymentLoanChanges(data, splitAmt) {
  const loansList = JSON.parse(JSON.stringify(data));
  if (loansList[0].loans.length && splitAmt.length) {
    loansList[0].loans.map((loan) => {
      const key = loan;
      if (key.active) {
        splitAmt.map((amt) => {
          if (amt.loanid === key.loanid) {
            key.partPaymentAmount = amt.payamount + amt.cashback;
            key.partPaymentCashback = amt.cashback;
            key.recovery = amt.recovery;
          }
          return true;
        });
      } else {
        key.partPaymentAmount = '--';
      }
      return key;
    });
  } else {
    loansList[0].loans.map((loan) => {
      const key = loan;
      key.partPaymentAmount = '--';
      return key;
    });
  }
  return loansList;
}
