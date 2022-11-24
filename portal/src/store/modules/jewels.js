import _ from 'lodash';
import { getJewelsListAPI } from '@/api/partRelease.api';
/* eslint import/no-cycle: [2, { maxDepth: 1 }] */
import setJewelsList from '@/utils/setJewelsList';

// initial state
const initialState = () => ({
  jewelsList: {},
  disabledContinueBtn: false,
  selectedJewelsCount: 0,
  selectedJewelsList: [],
  orderId: null,
  showErrorMessageModal: false,
  validationInfo: {},
  unselectLastSeletedJewel: false,
  selectedAddLoanClosure: false,
  actionMessages: {},
  closeInfoDetails: {},
});

// initial state
const states = initialState();

// getters
const getters = {
  jewelsList: (store) => store.jewelsList,
  disabledContinueBtn: (store) => store.disabledContinueBtn,
  selectedJewelsCount: (store) => store.selectedJewelsCount,
  selectedJewelsList: (store) => store.selectedJewelsList,
  orderId: (store) => store.orderId,
  showErrorMessageModal: (store) => store.showErrorMessageModal,
  validationInfo: (store) => store.validationInfo,
  unselectLastSeletedJewel: (store) => store.unselectLastSeletedJewel,
  selectedAddLoanClosure: (store) => store.selectedAddLoanClosure,
  actionMessages: (store) => store.actionMessages,
  closeInfoDetails: (store) => store.closeInfoDetails,
};
// actions
const actions = {
  selectJewels: ({ commit }, payload) => {
    commit('selectJewels', payload);
  },
  async getJewelsDetails({ commit }, payload) {
    const response = await getJewelsListAPI(payload);
    commit('setJewels', setJewelsList(response));
  },
  setLoanClosure: ({ commit }) => {
    commit('setLoanClosure');
  },
  updateDisabledContinueBtn({ commit }, payload) {
    commit('updateDisabledContinueBtn', payload);
  },
  selectedJewelsCount({ commit }, payload) {
    commit('selectedJewelsCount', payload);
  },
  selectedJewelsList({ commit }, payload) {
    commit('selectedJewelsList', payload);
  },
  orderId({ commit }, payload) {
    commit('orderId', payload);
  },
  showErrorMessageModal({ commit }, payload) {
    commit('showErrorMessageModal', payload);
  },
  validationInfo({ commit }, payload) {
    commit('validationInfo', payload);
  },
  unselectLastSeletedJewel({ commit }, payload) {
    commit('unselectLastSeletedJewel', payload);
  },
  selectedAddLoanClosure({ commit }, payload) {
    commit('selectedAddLoanClosure', payload);
  },
  actionMessages({ commit }, payload) {
    commit('actionMessages', payload);
  },
  checkMultipleLenders({ commit }, payload) {
    commit('checkMultipleLenders', payload);
  },
  resetState: ({ commit }) => {
    commit('resetState');
  },
  closeInfoDetails({ commit }, payload) {
    commit('closeInfoDetails', payload);
  },
};
// mutations
const mutations = {
  setJewels(state, payload) {
    state.jewelsList = payload;
  },
  selectJewels(state, payload) {
    if (payload.selectedLoan) {
      state.jewelsList.selectedLoan.map((element, mainIndex) => {
        const loansData = element;
        const jewelsSelectedArray = [];
        if (payload.loanIndex === mainIndex) {
          loansData.jewels.map((jewelInfo, index) => {
            const jewels = jewelInfo;
            if (index === payload.jewelIndex) jewels.isSelected = !jewels.isSelected;
            jewelsSelectedArray.push(jewels.isSelected);
            return jewels;
          });
        }
        loansData.hasJewelsSelected = jewelsSelectedArray.includes(true);
        return loansData;
      });
    } else {
      state.jewelsList.unSelectedLoan.map((element, mainIndex) => {
        const loansData = element;
        const jewelsSelectedArray = [];
        if (payload.loanIndex === mainIndex) {
          loansData.jewels.map((jewelInfo, index) => {
            const jewels = jewelInfo;
            if (index === payload.jewelIndex) jewels.isSelected = !jewels.isSelected;
            jewelsSelectedArray.push(jewels.isSelected);
            return jewels;
          });
        }
        loansData.hasJewelsSelected = jewelsSelectedArray.includes(true);
        return loansData;
      });
    }
  },
  checkMultipleLenders(state) {
    const selectedJewelsInfo = {};
    state.jewelsList.loans.forEach((loan) => {
      if (loan.hasJewelsSelected) {
        selectedJewelsInfo.branchId = loan.branchId;
        selectedJewelsInfo.lenderId = loan.lenderId;
      }
    });
    state.jewelsList.loans.map((loan) => {
      const loanData = loan;
      if (!_.isEmpty(selectedJewelsInfo)) {
        if (selectedJewelsInfo.branchId === loanData.branchId
          && selectedJewelsInfo.lenderId === loanData.lenderId) {
          loanData.hasDisable = false;
        } else {
          loanData.hasDisable = true;
        }
      } else {
        loanData.hasDisable = false;
      }
      return loanData;
    });
  },
  setLoanClosure(state) {
    state.jewelsList.selectedLoan.map((selectedLoan) => {
      const selectedLoans = selectedLoan;
      selectedLoans.isLoanClosure = selectedLoans.jewels.every((jewel) => jewel.isSelected);
      return selectedLoans;
    });
    if (state.jewelsList.unSelectedLoan.length) {
      state.jewelsList.unSelectedLoan.map((selectedLoan) => {
        const selectedLoans = selectedLoan;
        selectedLoans.isLoanClosure = selectedLoans.jewels.every((jewel) => jewel.isSelected);
        return selectedLoans;
      });
    }
  },
  updateDisabledContinueBtn(state, payload) {
    state.disabledContinueBtn = payload;
  },
  selectedJewelsCount(state, payload) {
    state.selectedJewelsCount = payload;
  },
  selectedJewelsList(state, payload) {
    state.selectedJewelsList = payload;
  },
  orderId(state, payload) {
    state.orderId = payload;
  },
  showErrorMessageModal(state, payload) {
    state.showErrorMessageModal = payload;
  },
  validationInfo(state, payload) {
    state.validationInfo = payload;
  },
  unselectLastSeletedJewel(state, payload) {
    state.unselectLastSeletedJewel = payload;
  },
  selectedAddLoanClosure(state, payload) {
    state.selectedAddLoanClosure = payload;
  },
  actionMessages(state, payload) {
    state.actionMessages = payload;
  },
  closeInfoDetails(state, payload) {
    state.closeInfoDetails = payload;
  },
  resetState(state) {
    Object.assign(state, initialState());
  },
};

export default {
  namespaced: true,
  state: states,
  getters,
  actions,
  mutations,
};
