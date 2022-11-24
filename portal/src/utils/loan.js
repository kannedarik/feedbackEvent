export default function populateLoanAmount(data, maxPartPayment) {
  // below method returns closing,interest,cashback,renewal amount sum for loan level
  const loanData = data.map((key) => {
    let prevLoan = {};
    return key.loans.map((loan, index) => {
      const amountsToBeCalculated = {
        closingamount: null,
        interestamount: null,
        renewalamount: null,
        cashbackamount: null,
        totalClosingAmount: null,
        totalInterestAmount: null,
        totalCashbackAmount: null,
        hardrecovery: null,
        toClosureAmount: null,
        loanisDiscrepancy: false,
        totalPartPaymentClosingAmount: null,
        partPaymentClosingAmount: null,
      };
      amountsToBeCalculated.totalClosingAmount = loan.loanHasDiscrepancy ? 0 : loan.closingamount;
      amountsToBeCalculated.totalPartPaymentClosingAmount = loan.closingamount;
      amountsToBeCalculated.totalInterestAmount = loan.interest;
      amountsToBeCalculated.totalCashbackAmount = loan.cashbackamount ? loan.cashbackamount : 0;
      amountsToBeCalculated.loanisDiscrepancy = loan.loanHasDiscrepancy;
      if (loan.active) {
        amountsToBeCalculated.closingamount = loan.loanHasDiscrepancy ? 0 : loan.closingamount;
        amountsToBeCalculated.partPaymentClosingAmount = loan.closingamount;
        amountsToBeCalculated.renewalamount = loan.renewalamount;
        amountsToBeCalculated.interestamount = loan.interest ? loan.interest : 0;
        amountsToBeCalculated.hardrecovery = loan.hardrecovery;
        amountsToBeCalculated.toClosureAmount = loan.takeover?.istakeover ? loan.closingamount : 0;
        if (loan?.schemedata?.cashback
            && ((prevLoan?.schemedata?.cashback && prevLoan?.active) || index === 0)) {
          amountsToBeCalculated.cashbackamount = loan.cashbackamount ? loan.cashbackamount : 0;
        } else {
          amountsToBeCalculated.cashbackamount = 0;
        }
      }
      prevLoan = loan;
      return amountsToBeCalculated;
    });
  });
  // populateAmounts will have sum of interest, closing amt, etc of all loans
  const populateAmounts = {
    closingAmount: null,
    repledgeAmount: null,
    interestAmount: null,
    rebateAmount: null,
    totalClosingAmount: null,
    totalInterestAmount: null,
    hardrecovery: null,
    toClosureAmount: null,
    partPaymentClosingAmount: null,
  };
  loanData.map((key) => {
    key.map((loan) => {
      populateAmounts.interestAmount += loan.interestamount || loan.cashbackamount
        ? loan.interestamount - loan.cashbackamount : 0;
      populateAmounts.closingAmount += loan.closingamount || (!loan.loanisDiscrepancy
        && loan.cashbackamount) ? loan.closingamount - loan.cashbackamount : 0;
      populateAmounts.partPaymentClosingAmount += loan.partPaymentClosingAmount
        || loan.cashbackamount ? loan.partPaymentClosingAmount - loan.cashbackamount : 0;
      populateAmounts.repledgeAmount += loan.renewalamount || loan.closingamount
        ? loan.closingamount - loan.renewalamount : 0;
      populateAmounts.rebateAmount += loan.cashbackamount ? loan.cashbackamount : 0;
      populateAmounts.totalClosingAmount += loan.totalClosingAmount
        ? loan.totalClosingAmount - (!loan.loanisDiscrepancy ? loan.totalCashbackAmount : 0) : 0;
      populateAmounts.totalInterestAmount += loan.totalInterestAmount || loan.totalCashbackAmount
        ? loan.totalInterestAmount - loan.totalCashbackAmount : 0;
      populateAmounts.hardrecovery += loan.hardrecovery ? loan.hardrecovery : 0;
      populateAmounts.toClosureAmount += loan.toClosureAmount ? loan.toClosureAmount : 0;
      return true;
    });
    return true;
  });
  const totalPPClosingAmt = populateAmounts.partPaymentClosingAmount;
  const maxPPAmount = maxPartPayment.maxPartPaymentAmountRange;
  populateAmounts.partPaymentClosingAmount = totalPPClosingAmt - maxPPAmount;
  return populateAmounts;
}

export function isSecureComponent(loanComponent) {
  return loanComponent.netweight > 0;
}

export function isUnsecureComponent(loanComponent) {
  return loanComponent.netweight === 0;
}

/**
 * Given an array of loans, returns an array of all secure components.
 * @param loans - An array of loans.
 * @returns {*} - An array of all secure components of the given loans.
 */
export function allSecureComponents(loans) {
  return loans.flatMap((loan) => loan.loans).filter(isSecureComponent);
}

export function secureComponent(loan) {
  return loan.loans.find(isSecureComponent);
}

export function unsecureComponent(loan) {
  return loan.loans.find(isUnsecureComponent);
}
