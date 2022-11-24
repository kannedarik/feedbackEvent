import Vue from 'vue';
import VueNoty from 'vuejs-noty';
import { createPartReleaseOrderAPI } from '@/api/partRelease.api';
import store from '../store';
import router from '../router';

Vue.use(VueNoty);

// function call to calculated amount the based on selected jewels.
async function checkSelectedLoan(event) {
  const { allLoans } = store.state.loans;
  allLoans.forEach((groupedLoan, groupIndex) => {
    groupedLoan.loans.forEach((item, groupLoanIndex) => {
      item.loans.forEach((loan) => {
        event.coreId.forEach((coreId) => {
          if (+loan.coreid === +coreId) {
            store.dispatch('loans/selectLoans', { groupIndex, groupLoanIndex });
            store.dispatch('loans/setSelectedLoans');
          }
        });
      });
    });
  });
}
function getJewelsDetails(loan) {
  const loansObj = {
    loanId: +loan.loanId,
    jewelsSelected: [],
    closing: loan.isLoanClosure,
  };
  loan.jewels.forEach((jewel) => {
    if (jewel.isSelected) {
      loansObj.jewelsSelected.push(jewel.id);
    }
  });
  return loansObj;
}

function getSelectedJewels() {
  const selectedLoansJewels = store.state.jewels.jewelsList;
  const loansArray = [];
  const loans = [];
  selectedLoansJewels.selectedLoan.map((loan) => loansArray.push(getJewelsDetails(loan)));
  selectedLoansJewels.unSelectedLoan.map((loan) => loansArray.push(getJewelsDetails(loan)));
  loansArray.map((key) => {
    if (key.jewelsSelected.length) {
      loans.push(key);
    }
    return true;
  });
  return loans;
}
function getOrnamentList(jewelsList) {
  const result = Object.values(jewelsList.reduce((jewels, { ornamentType, noOfItems }) => {
    const data = jewels;
    const key = ornamentType;
    data[key] = data[key] || { ornamentType, ornamentCount: 0 };
    data[key].ornamentCount += noOfItems;
    return data;
  }, {}));
  return result;
}

// function call to if selected all the jewels then move to the closure screen.
async function setLoanClosure(event) {
  checkSelectedLoan(event);
  const selectedLoansList = store.state.loans.selectedLoans;
  store.dispatch('loans/populateLoanAmount', selectedLoansList);
  store.dispatch('jewels/resetState');
  router.push('/close-loan-summary');
}
async function createPartReleaseOrder() {
  const tempObj = {
    productCategory: 'goldloan',
    process: 'part-release',
    loans: [],
  };
  tempObj.loans = getSelectedJewels();
  tempObj.loans = tempObj.loans.filter((loan) => !loan.closing);
  createPartReleaseOrderAPI(tempObj)
    .then((responses) => {
      router.push(`/partial-release-summary?orderId=${responses.data.data.order.id}`);
    })
    .catch((error) => {
      Vue.noty.error(error);
    });
}

async function closeLoanPartRelease(event) {
  const selectedLoansJewels = store.state.jewels.jewelsList;
  const message = store.state.loans.closureBlockedDiscrepancyMessage;
  store.dispatch('jewels/showErrorMessageModal', false);
  if (event.type === 'CloseLoan') {
    const loanId = [];
    const discrepancy = [];
    const loanDetails = [];
    selectedLoansJewels.loans.forEach((loan) => {
      if (loan.isLoanClosure) {
        discrepancy.push(loan.hasDiscrepancy);
        loanId.push(+loan.loanId);
      }
      if (loan.isLoanClosure && loan.hasDiscrepancy) {
        loanDetails.push({
          hasShowHeader: true,
          lendersInfo: loan.lender,
          loanId: loan.loanId,
          loanDate: loan.loanStartDate,
          loanAmount: loan.amount,
          jewelsList: getOrnamentList(loan.jewels),
        });
      }
    });
    if (discrepancy.every((key) => key)) {
      Vue.noty.show(message);
    } else if (discrepancy.includes(false) && loanDetails.length) {
      const closeInfoDetails = {
        hasInfo: true,
        nonDiscrepancyoanCount: discrepancy.length - loanDetails.length,
        loanDetails,
      };
      store.dispatch('jewels/closeInfoDetails', closeInfoDetails);
    } else {
      const tempObj = {
        type: 'closeLoan',
        coreId: loanId,
      };
      store.dispatch('loans/setPaymentOption', 'closeLoan');
      setLoanClosure(tempObj);
    }
  } else {
    createPartReleaseOrder();
  }
}

export {
  closeLoanPartRelease,
  createPartReleaseOrder,
  getSelectedJewels,
  getOrnamentList,
  setLoanClosure,
};
