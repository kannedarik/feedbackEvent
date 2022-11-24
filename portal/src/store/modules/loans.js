import _ from 'lodash';
import { partPaymentSplit } from '@/api/customer.api';
import { getPartReleaseFeatureFlagAPI } from '@/api/partRelease.api';
import populateLoanAmount, { secureComponent } from '@/utils/loan';
import selectedLoanChanges from '@/utils/selectedloans';
import partPaymentLoanChanges from '@/utils/partPayment';

// initial state
const initialState = () => ({
  allLoans: [],
  selectedLoans: [],
  populateAmounts: {
    closingAmount: null,
    renewalamount: null,
    interestAmount: null,
    repledgeAmount: null,
    totalClosingAmount: null,
    totalInterestAmount: null,
    hardrecovery: null,
    toClosureAmount: null,
  },
  discrepancyMessage: {
    interestRepayment: '',
    release: '',
  },
  paymentMethodsVirtualAccount: null,
  paymentOption: '',
  hasDiscrepancy: false,
  lendersConfig: {},
  partPaymentAmount: null,
  partPaymentInfo: [],
  hasTakeover: false,
  totalLoans: [],
  hideLoanSelection: false,
  hasReSetPIN: false,
  partReleaseFeatureFlag: {
    'part-release': false,
  },
  statusCardOrders: null,
  maxPartPaymentAmount: {},
  haspreviousURLName: '',
  closureBlockedDiscrepancyMessage: '',
});

// initial state
const states = initialState();

// getters
const getters = {
  allLoans: (store) => store.allLoans,
  selectedLoans: (store) => store.selectedLoans,
  populateAmounts: (store) => store.populateAmounts,
  discrepancyMessage: (store) => store.discrepancyMessage,
  paymentMethodsVirtualAccount: (store) => store.paymentMethodsVirtualAccount,
  paymentOption: (store) => store.paymentOption,
  disabledContinueBtn: (store) => store.disabledContinueBtn,
  getLoanBySecureComponentID:
    (store, otherGetters) => (secureLoanComponentID) => otherGetters.allLoans
      .flatMap((loanGroup) => loanGroup.loans)
      .find((loan) => {
        const theSecureComponent = secureComponent(loan);
        if (!theSecureComponent) return false;
        return theSecureComponent.loanid === secureLoanComponentID;
      }),
  hasDiscrepancy: (store) => store.hasDiscrepancy,
  lendersConfig: (store) => store.lendersConfig,
  partPaymentAmount: (store) => store.partPaymentAmount,
  partPaymentInfo: (store) => store.partPaymentInfo,
  hasTakeover: (store) => store.hasTakeover,
  totalLoans: (store) => store.totalLoans,
  hideLoanSelection: (store) => store.hideLoanSelection,
  hasReSetPIN: (store) => store.hasReSetPIN,
  partReleaseFeatureFlag: (store) => store.partReleaseFeatureFlag,
  statusCardOrders: (store) => store.statusCardOrders,
  maxPartPaymentAmount: (store) => store.maxPartPaymentAmount,
  haspreviousURLName: (store) => store.haspreviousURLName,
  closureBlockedDiscrepancyMessage: (store) => store.closureBlockedDiscrepancyMessage,
};
// actions
const actions = {
  setLoans: ({ commit }, payload) => {
    commit('setLoans', payload);
  },
  setSelectedLoans: ({ commit }) => {
    commit('setSelectedLoans');
  },
  selectLoans: ({ commit }, payload) => {
    commit('selectLoans', payload);
  },
  resetSelectedLoans: ({ commit }) => {
    commit('resetSelectedLoans');
  },
  reSetPIN: ({ commit }, payload) => {
    commit('reSetPIN', payload);
  },
  async populateLoanAmount({ commit, state }, payload) {
    commit('populateLoanAmount',
      populateLoanAmount(payload, state.maxPartPaymentAmount));
  },
  setDiscrepancyMessage: ({ commit }, payload) => {
    commit('setDiscrepancyMessage', payload);
  },
  async selectedLoanChanges({ commit }, payload) {
    const response = selectedLoanChanges(payload.selectedLoans, payload.loanId);
    commit('selectedLoanChanges', response);
    commit('populateLoanAmount', populateLoanAmount(response));
    commit('selectedLoanChanges', response);
  },
  async partPaymentData({ commit }, payload) {
    const response = await selectedLoanChanges(payload.selectedLoans, payload.loanId);
    const sendData = {
      loans: [],
      amount: payload.partPaymentAmount.toString(),
    };
    response.map((key) => {
      key.loans.map((loan) => {
        if (loan.active) {
          sendData.loans.push({ loanid: loan.loanid });
        }
        return true;
      });
      return true;
    });
    const partPaymentSplitResponse = await partPaymentSplit(sendData);
    commit('selectedLoanChanges', response);
    commit('selectedLoanChanges',
      partPaymentLoanChanges(response,
        _.get(partPaymentSplitResponse, 'data.response.amountMapPerLoan', [])));
  },
  paymentMethodsAndVirtualAccount: ({ commit }, payload) => {
    commit('paymentMethodsAndVirtualAccount', payload);
  },
  setPaymentOption: ({ commit }, payload) => {
    commit('setPaymentOption', payload);
  },
  checkLoansForMultipleLenders({ commit }, payload) {
    commit('checkLoansForMultipleLenders', payload);
  },
  hasDiscrepancy: ({ commit }, payload) => {
    commit('hasDiscrepancy', payload);
  },
  setLendersConfig: ({ commit }, payload) => {
    commit('setLendersConfig', payload);
  },
  partPaymentAmount: ({ commit }, payload) => {
    commit('partPaymentAmount', payload);
  },
  partPaymentInfo: ({ commit }, payload) => {
    commit('partPaymentInfo', payload);
  },
  hasTakeover: ({ commit }, payload) => {
    commit('hasTakeover', payload);
  },
  updatedALLLoans: ({ commit }, payload) => {
    commit('updatedALLLoans', payload);
  },
  setHideLoanSelection: ({ commit }, payload) => {
    commit('setHideLoanSelection', payload);
  },
  resetState: ({ commit }) => {
    commit('resetState');
  },
  maxPartPaymentAmountConfig: ({ commit }, payload) => {
    commit('maxPartPaymentAmountConfig', payload);
  },
  updatedSelectedLoan: ({ commit }) => {
    commit('updatedSelectedLoan');
  },
  async getPartReleaseFeatureFlag({ commit }) {
    const response = await getPartReleaseFeatureFlagAPI();
    commit('setPartReleaseFeatureFlag', response.data.data);
  },
  repledgePendingLoansOrders: ({ commit }, payload) => {
    commit('repledgePendingLoansOrders', payload);
  },
  haspreviousURLName: ({ commit }, payload) => {
    commit('haspreviousURLName', payload);
  },
  setClosureBlockedDiscrepancyMessage: ({ commit }, payload) => {
    commit('setClosureBlockedDiscrepancyMessage', payload);
  },
};
// mutations
const mutations = {
  setLoans(state, payload) {
    state.allLoans = payload;
  },
  setSelectedLoans(state) {
    state.selectedLoans = [];
    state.allLoans.forEach((loansArray) => {
      loansArray.loans.forEach((key) => {
        if (key.isSelected) {
          state.selectedLoans.push(key);
        }
      });
    });
  },
  selectLoans(state, payload) {
    state.allLoans.map((element, mainIndex) => {
      const allLoan = element;
      if (payload && payload.groupIndex === mainIndex) {
        allLoan.loans.map((loan, index) => {
          const loanInfo = loan;
          if (index === payload.groupLoanIndex) loanInfo.isSelected = !loanInfo.isSelected;
          return loanInfo;
        });
      }
      return allLoan;
    });
  },
  resetSelectedLoans(state) {
    state.allLoans.map((element) => {
      const allLoan = element;
      allLoan.loans.map((loan) => {
        const loanInfo = loan;
        loanInfo.isSelected = false;
        return loanInfo;
      });
      return allLoan;
    });
  },
  populateLoanAmount(state, payload) {
    state.populateAmounts = payload;
  },
  setDiscrepancyMessage(state, payload) {
    state.discrepancyMessage = payload;
  },
  selectedLoanChanges(state, payload) {
    state.selectedLoans = payload;
  },
  paymentMethodsAndVirtualAccount(state, payload) {
    state.paymentMethodsVirtualAccount = payload;
  },
  setPaymentOption(state, payload) {
    state.paymentOption = payload;
  },
  // checking multiple leanders
  checkLoansForMultipleLenders(state, payload) {
    state.allLoans.map((key) => {
      const lenders = [];
      key.loans.map((loadData) => {
        const data = loadData;
        data.loans.map((loan) => {
          lenders.push(loan.lenderid);
          return true;
        });
        // comapring the lenders
        if (lenders[0] === payload[0] || state.selectedLoans.length === 0) {
          data.isDisabled = false;
        } else {
          data.isDisabled = true;
        }
        return data;
      });
      return key;
    });
  },
  hasDiscrepancy(state, payload) {
    state.hasDiscrepancy = payload;
  },
  setLendersConfig(state, payload) {
    state.lendersConfig = payload;
  },
  partPaymentAmount(state, payload) {
    state.partPaymentAmount = payload;
  },
  partPaymentInfo(state, payload) {
    state.partPaymentInfo = payload;
  },
  hasTakeover(state, payload) {
    state.hasTakeover = payload;
  },
  updatedALLLoans(state, payload) {
    state.totalLoans = payload;
  },
  setHideLoanSelection(state, payload) {
    state.hideLoanSelection = payload;
  },
  reSetPIN(state, payload) {
    state.hasReSetPIN = payload;
  },
  resetState(state) {
    Object.assign(state, initialState());
  },
  maxPartPaymentAmountConfig(state, payload) {
    state.maxPartPaymentAmount = payload;
  },
  updatedSelectedLoan(state) {
    state.selectedLoans.map((key) => {
      const data = key;
      data.loans.map((loan) => {
        const loanData = loan;
        loanData.recovery = loanData.reconrecovery;
        return loanData;
      });
      return data;
    });
  },
  setPartReleaseFeatureFlag(state, payload) {
    state.partReleaseFeatureFlag = payload.flags;
  },
  repledgePendingLoansOrders(state, payload) {
    state.statusCardOrders = payload;
  },
  haspreviousURLName(state, payload) {
    state.haspreviousURLName = payload;
  },
  setClosureBlockedDiscrepancyMessage(state, payload) {
    state.closureBlockedDiscrepancyMessage = payload.message;
  },
};

export default {
  namespaced: true,
  state: states,
  getters,
  actions,
  mutations,
};
