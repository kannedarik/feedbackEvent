import _ from 'lodash';
import { getPaymentMethods, getPaymentOptionsForOrderID } from '@/api/customer.api';
import store from '@/store';
import router from '@/router';

function updatepaymentMethods(response, payableAmount = 0) {
  let supportedPaymentMethods = [];
  let virtualAccountNumbers = [];
  const selectedLoans = store.getters['loans/selectedLoans'];
  const lendersConfig = store.getters['loans/lendersConfig'];
  supportedPaymentMethods = response.map((paymentMethods) => paymentMethods.name);
  const getVanObj = response.filter((paymentMethods) => paymentMethods.name === 'neft');
  if (supportedPaymentMethods.includes('neft')) {
    virtualAccountNumbers = getVanObj[0].vandetails;
    virtualAccountNumbers.map((loanInfo) => {
      const loanData = loanInfo;
      selectedLoans.forEach((selectedLoan) => {
        selectedLoan.loans.forEach((loan) => {
          if (loanData.losid === loan.coreid) {
            loanData.lender = `${_.join(_.map(loan.lenders, (lender) => lendersConfig[lender].name), ' & ')}`;
            loanData.loanamount = loan.totalLoanamount;
          }
        });
      });
      return loanData;
    });
  }

  store.dispatch('loans/paymentMethodsAndVirtualAccount',
    {
      paymentsMethods: supportedPaymentMethods,
      virtualAccount: virtualAccountNumbers,
      payableAmount,
    });
  router.push('/new-payment-options');
}

function getPaymentMethodsBasedOnLoansLender(selectedLoan, paymentOption, isTakeover) {
  const lendersArray = [];
  const loansArray = [];
  selectedLoan.map((key) => {
    let prevLoan = {};
    return key.loans.map((loan, index) => {
      if (loan.active) {
        lendersArray.push(loan.lenderid);
        const loanData = {};
        switch (paymentOption) {
          case 'interest':
            loansArray.push({
              loanid: loan.loanid,
              amount: loan.interest || loan.cashbackamount
                ? loan.interest - (loan.cashbackamount && (prevLoan.active || index === 0)
                  ? loan.cashbackamount : 0) : 0,
            });
            break;
          case 'closeLoan':
            if (!loan.loanHasDiscrepancy) {
              loansArray.push({
                loanid: loan.loanid,
                amount: loan.closingamount || loan.cashbackamount
                  ? loan.closingamount - (loan.cashbackamount && (prevLoan.active || index === 0)
                    ? loan.cashbackamount : 0) : 0,
              });
            }
            break;
          case 'rePledge':
            loanData.loanid = loan.loanid;
            if (loan.lenderid === 'federal') {
              if (loan.replegeAmtUpdated) {
                loanData.amount = _.get(loan, 'moreRepledge.repledgeamount', 0);
                loanData.repledgetype = _.get(loan, 'moreRepledge.currentDayPrincipleAmount')
                  ? _.get(loan, 'moreRepledge.keyword') : '';
              } else {
                loanData.amount = _.get(loan, 'defaultRepledge.repledgeamount', 0);
                loanData.repledgetype = _.get(loan, 'defaultRepledge.currentDayPrincipleAmount')
                  ? _.get(loan, 'defaultRepledge.keyword') : '';
              }
            } else {
              loanData.amount = _.get(loan, 'repledgeamount', 0);
            }
            loansArray.push(loanData);
            break;
          case 'partPayment':
            loansArray.push({
              loanid: loan.loanid,
              amount: +(loan.partPaymentAmount) || loan.partPaymentCashback
                ? +(loan.partPaymentAmount) - (loan.partPaymentCashback
                  && (prevLoan.active || index === 0)
                  ? loan.partPaymentCashback : 0) : 0,
            });
            break;
          default:
            if (paymentOption === 'hardrecovery') {
              if (isTakeover) {
                loansArray.push({
                  loanid: loan.loanid,
                  amount: loan.closingamount
                    ? loan.closingamount : 0,
                });
              } else {
                loansArray.push({ loanid: loan.loanid, amount: +(loan.hardrecovery) });
              }
            }
            break;
        }
      }
      prevLoan = loan;
      return true;
    });
  });
  const requestObj = {};
  requestObj.lender = [...new Set(lendersArray)];
  requestObj.type = isTakeover ? 'closeLoan' : paymentOption;
  requestObj.loans = loansArray;
  getPaymentMethods(requestObj)
    .then((response) => {
      if (response.status === 200) {
        updatepaymentMethods(response.data.response);
      }
    })
    .catch((error) => {
      this.$noty.error(error);
    });
}
function makePartReleasePay(orderId) {
  getPaymentOptionsForOrderID(orderId)
    .then((response) => {
      if (response.status === 200) {
        updatepaymentMethods(response.data.data.paymentOptions, response.data.data.amount);
      }
    })
    .catch((error) => {
      this.$noty.error(error);
    });
}

export {
  getPaymentMethodsBasedOnLoansLender,
  makePartReleasePay,
};
