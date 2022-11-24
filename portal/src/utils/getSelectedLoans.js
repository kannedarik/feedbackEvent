import _ from 'lodash';
import store from '@/store';
import errorMessages from '@/utils/errorMessages';
import { getCustomerLoans } from '@/api/customer.api';

function getuloanId(loans) {
  let uloanId = '';
  loans.forEach((key) => {
    if (!key.netweight) {
      uloanId = key.loanid;
    }
  });
  return uloanId;
}
function hasDiscrepancy(loans) {
  const tempArray = [];
  loans.map((loan) => {
    tempArray.push(_.get(loan, 'discrepancy.prioritySlab') === 'SLAB2'
      && !_.get(loan, 'discrepancy.discrepancyResolvedDate'));
    return true;
  });
  return tempArray.includes(true);
}
function getSelectedLoans(selectedLoanIds) {
  const lendersConfig = store.getters['loans/lendersConfig'];
  const partPaymentInfo = store.getters['loans/partPaymentInfo'];
  getCustomerLoans()
    .then((response) => {
      if (response.data.code === 200) {
        const allLoans = response.data.mappedloans.map((groupedLoans, index) => {
          groupedLoans.loans.map((key) => key.map((key1) => {
            const loan = key1;
            loan.uloanId = getuloanId(key);
            return loan;
          }));
          const groupedLoansArray = groupedLoans;
          if (groupedLoansArray.type === 'N:1') {
            groupedLoansArray.loans = groupedLoans.loans[0].map((key) => [
              key,
            ]);
          }
          const modifiedArray = groupedLoansArray;
          modifiedArray.loans = groupedLoansArray.loans.map((groupedLoan) => {
            const loanObj = {};
            loanObj.loans = groupedLoan.map((loan) => {
              const loanData = loan;
              if (partPaymentInfo.length) {
                partPaymentInfo.forEach((loanInfo) => {
                  if (loanInfo.loanId === loanData.coreid) {
                    loanData.partPaymentAmount = loanInfo.partPaymentAmount;
                    loanData.partPaymentCashback = 0;
                  }
                });
              }
              loanData.productType = groupedLoansArray.productType;
              loanData.lenders = [];
              loanData.lenders.push(loanData.lenderid);
              loanData.lenders = [...loanData.lenders, ..._.get(loanData, 'clmSupportedLender', [])];
              loanData.lenders = [...new Set(loanData.lenders)];
              loanData.totalLoanamount = groupedLoan.reduce((amount, item) => amount
                + item.loanamount, 0);
              loanData.replegeAmtUpdated = false;
              loanData.active = true;
              loanData.groupId = index;
              loanData.loanHasDiscrepancy = hasDiscrepancy(groupedLoan);
              loanData.closingamount = _.get(loan, 'closures.release')
                ? loan.closures.release : loan.closingamount;
              loanData.interest = _.get(loan, 'closures.interest')
                ? loan.closures.interest : loan.interest;
              loanData.lenderName = lendersConfig[loanData.lenderid].name;
              loanObj.bookedDate = groupedLoan[0].loanstartedon;
              loanObj.isSelected = selectedLoanIds.includes(loanData.coreid);
              loanObj.isDisabled = false;
              return loanData;
            });
            return loanObj;
          });
          return modifiedArray;
        });
        store.dispatch('loans/setLoans', allLoans);
        store.dispatch('loans/setSelectedLoans');
      }
    })
    .catch((error) => {
      errorMessages(error);
    });
}

export default getSelectedLoans;
