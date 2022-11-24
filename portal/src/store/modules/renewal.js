// Module that manages Vuex state related to the renewal / loan enhancement flow.

import Vue from 'vue';
import {
  allSecureComponents,
  isSecureComponent,
  secureComponent,
  unsecureComponent,
} from '@/utils/loan';
import _ from 'lodash';
import {
  getrenewalScheme,
  getNewLoanDetailsAPI,
  getLoanEnhancementOptions,
} from '@/api/repledge.api';

export const SelectionType = Object.freeze({
  LOAN_ENHANCEMENT: 'le',
  RENEWAL: 'renewal',
});

export const RenewalOptions = Object.freeze({
  MORE: 'more',
  DEFAULT: 'default',
});

const initialState = () => ({
  renewalScheme: null,
  newLoansData: null,
  loanEnhancementOptions: null,
  // selectionState is a map of loan IDs to their loan amount selections.
  // The keys are the loan ID of the secure component of the loan.
  // Loan amount selection can be of type 'renewal',
  // in which case the options available are 'default' and 'more'.
  // The selection can also be of type 'le' (loan enhancement),
  // in which case the selection is identified by selectedLESchemeID.
  // selectedLESchemeID is the scheme ID of whichever LE option is selected.
  // The loan enhancement options are shared across selected loans.
  // Only one scheme is allowed for loan enhancement, across all loans.
  // Hence, selection of loan enhancement option for one loan can change
  // selection of loan enhancement option for another loan also
  // if its already selected for le.
  //
  // Sample data:
  // selectionState: {
  //   // The value of the state is nullable as options are not pre selected
  //   // If the value against a loan id is null, it should be interpreted
  //   // as the default renewal option when making API calls.
  //   lploanid1: {
  //     type: SelectionType.LOAN_ENHANCEMENT,
  //   },
  //   lploanid2: {
  //     type: SelectionType.RENEWAL,
  //     renewalOption: RenewalOptions.MORE,
  //   },
  //   lploanid3: {
  //     type: SelectionType.RENEWAL,
  //     renewalOption: RenewalOptions.DEFAULT,
  //   },
  // },
  // selectedLESchemeID: "OEUTZLJKX",
  selectedLESchemeID: null,
  selectionState: {},

  // This is the finalized selection data after the modal is closed.
  // We maintain this as a separate copy so that we can cancel and
  // revert our changes. newLoansData and loanEnhancementOptions
  // also need to be copied over, because they are tied to the
  // selection state.
  confirmedRenewalData: {
    selectedLESchemeID: null,
    selectionState: {},
    newLoansData: null,
    loanEnhancementOptions: null,
  },

  // The LP loan ID of the loan being currently viewed in the
  // LoanAmountSelectionModal.
  currentLPLoanID: null,
  aadhaarVerificationStatus: false,
  aadhaarInValidMessage: {
    message: '',
    remainingAttempts: 0,
    hasInvalidAadhaar: false,
  },
  hasShowExitModal: false,
  aadhaarOTPInValidMessage: {
    message: '',
    remainingAttempts: 0,
    hasInvalidOTP: false,
  },
  renewalFlow: {
    hasRenewalFlow: false,
    payableAmount: 0,
    virtualAccount: [],
    methods: [],
  },
});

// initial state
const states = initialState();

const mutations = {
  setSelectionState(state, newSelectionState) {
    state.selectionState = newSelectionState;
  },
  aadhaarVerificationStatus(state, data) {
    state.aadhaarVerificationStatus = data;
  },

  aadhaarInValidMessage(state, data) {
    state.aadhaarInValidMessage = data;
  },

  aadhaarOTPInValidMessage(state, data) {
    state.aadhaarOTPInValidMessage = data;
  },

  hasShowExitModal(state, data) {
    state.hasShowExitModal = data;
  },

  hasSetRenewalFlow(state, data) {
    state.renewalFlow = data;
  },

  resetState(state) {
    Object.assign(state, initialState());
  },

  clearConfirmedSelectionState(state) {
    state.confirmedRenewalData = {
      selectedLESchemeID: null,
      selectionState: {},
      newLoansData: null,
      loanEnhancementOptions: null,
    };
  },

  confirmRenewalData(state) {
    state.confirmedRenewalData = {
      selectionState: _.cloneDeep(state.selectionState),
      selectedLESchemeID: state.selectedLESchemeID,
      newLoansData: state.newLoansData,
      loanEnhancementOptions: state.loanEnhancementOptions,
    };
  },

  setSelectionStateOfLoanID(state, { loanid, value }) {
    state.selectionState = {
      ...state.selectionState,
      [loanid]: value,
    };
  },
  copyConfirmedSelectionStateToSelectionState(state) {
    state.selectionState = _.cloneDeep(
      state.confirmedRenewalData.selectionState,
    );
    state.selectedLESchemeID = state.confirmedRenewalData.selectedLESchemeID;
  },
  setRenewalScheme(state, renewalSchemeResponse) {
    state.renewalScheme = renewalSchemeResponse;
  },

  setNewLoansData(state, newLoansDataResponse) {
    state.newLoansData = newLoansDataResponse;
  },

  setLoanEnhancementOptions(state, loanEnhancementOptions) {
    state.loanEnhancementOptions = loanEnhancementOptions;
  },

  setSelectedLESchemeID(state, newSchemeID) {
    state.selectedLESchemeID = newSchemeID;
  },

  setCurrentLPLoanID(state, newCurrentLPLoanID) {
    state.currentLPLoanID = newCurrentLPLoanID;
  },
};

const setCommonRenewalData = (selectedLoan, newLoanOrLEData) => {
  const aSecureComponent = secureComponent(selectedLoan);
  const anUnsecureComponent = unsecureComponent(selectedLoan);

  aSecureComponent.oldscheme = newLoanOrLEData.oldscheme;
  if (newLoanOrLEData.oldSecureCharges) {
    aSecureComponent.oldSecureCharges = newLoanOrLEData.oldSecureCharges;
  }

  if (newLoanOrLEData.oldUnSecureCharges) {
    aSecureComponent.oldUnSecureCharges = newLoanOrLEData.oldUnSecureCharges;
  }

  if (anUnsecureComponent) {
    anUnsecureComponent.oldscheme = newLoanOrLEData.oldscheme;
    if (newLoanOrLEData.oldSecureCharges) {
      anUnsecureComponent.oldSecureCharges = newLoanOrLEData.oldSecureCharges;
    }

    if (newLoanOrLEData.oldUnSecureCharges) {
      anUnsecureComponent.oldUnSecureCharges = newLoanOrLEData.oldUnSecureCharges;
    }
  }

  aSecureComponent.hasMore = newLoanOrLEData.hasMore;
  aSecureComponent.isEligibleLE = newLoanOrLEData.isEligibleForLoanEnhancement;
  aSecureComponent.defaultRepledge = newLoanOrLEData.defaultRepledge;
  aSecureComponent.moreRepledge = newLoanOrLEData.moreRepledge;

  aSecureComponent.newLoan[1].defaultRepledge = aSecureComponent.defaultRepledge;
  aSecureComponent.newLoan[1].moreRepledge = aSecureComponent.moreRepledge;
  aSecureComponent.newLoan[1].scheme = newLoanOrLEData.scheme;
  aSecureComponent.newLoan[1].oldscheme = newLoanOrLEData.oldscheme;

  if (
    selectedLoan.loans.length === 1
    && newLoanOrLEData.oldunsecure
    && newLoanOrLEData.oldunsecure.oldamount
  ) {
    const unsecureData = _.cloneDeep(aSecureComponent);
    unsecureData.coreid = newLoanOrLEData.oldunsecure.loanid;
    unsecureData.loanamount = newLoanOrLEData.oldunsecure.oldamount;
    unsecureData.lenderName = 'Rupeek';
    unsecureData.lenderid = 'rupeek';
    unsecureData.loanType = 'N:1';
    unsecureData.netweight = 0;
    delete unsecureData.defaultRepledge;
    delete unsecureData.moreRepledge;
    selectedLoan.loans.push(unsecureData);
  }
};

const loanEnhancementDataTuple = (
  lploanid,
  loanEnhancementOptions,
  selectedLESchemeID,
) => {
  if (!loanEnhancementOptions || loanEnhancementOptions.length === 0) { return null; }

  const selectedLEOption = loanEnhancementOptions.find(
    (option) => option.scheme.id === selectedLESchemeID,
  );

  if (!selectedLEOption) return null;

  const secureComponentOfTuple = (tuple) => tuple.find((component) => component.type === 'secure');

  return selectedLEOption.loans
    .filter((x) => x) // remove nulls
    .find(
      (loanComponentTuple) => secureComponentOfTuple(loanComponentTuple).lploanid === lploanid,
    );
};

const secureLoanEnhancementData = (
  lploanid,
  loanEnhancementOptions,
  selectedLESchemeID,
) => {
  const tuple = loanEnhancementDataTuple(
    lploanid,
    loanEnhancementOptions,
    selectedLESchemeID,
  );
  if (!tuple) return null;

  return tuple.find((component) => component.type === 'secure');
};

const getters = {
  currentLPLoanID: (state) => state.currentLPLoanID,

  aadhaarVerificationStatus: (state) => state.aadhaarVerificationStatus,

  aadhaarInValidMessage: (state) => state.aadhaarInValidMessage,

  aadhaarOTPInValidMessage: (state) => state.aadhaarOTPInValidMessage,

  hasShowExitModal: (state) => state.hasShowExitModal,

  renewalFlow: (state) => state.renewalFlow,

  renewalScheme: (state) => state.renewalScheme,

  selectedLESchemeID: (state) => state.selectedLESchemeID,

  currentLoanIndex: (state, localGetters, rootState, rootGetters) => rootGetters['loans/selectedLoans'].findIndex(
    (loan) => secureComponent(loan).loanid === state.currentLPLoanID,
  ),

  // This function constructs the selectedLoans prop for the repledgeLoanSummary component
  // in the format that it expects to display the correct data. This is a hack introduced
  // because we don't want to refactor or rewrite the repledgeLoanSummary component.
  // Most of the code is adapted from https://github.com/Rupeek/payment-web/blob/master/Mobile/src/components/Common/Summary/repledgeLoanSummary.vue#L754
  selectedLoansForSummaryScreen: (
    state,
    localGetters,
    rootState,
    rootGetters,
  ) => {
    if (_.isEqual(state.confirmedRenewalData.selectionState, {})) return [];

    const selectedLoans = _.cloneDeep(rootGetters['loans/selectedLoans']);
    selectedLoans.forEach((selectedLoan) => {
      const secureComponentOfSelectedLoan = secureComponent(selectedLoan);
      const lpLoanIDofSelectedLoan = secureComponentOfSelectedLoan.loanid;

      if (
        state.confirmedRenewalData.selectionState[lpLoanIDofSelectedLoan]
          .type === SelectionType.RENEWAL
      ) {
        secureComponentOfSelectedLoan.newLoan = _.cloneDeep(
          state.confirmedRenewalData.newLoansData.loans.find(
            (loanComponentTuple) => loanComponentTuple.find(
              ({ type, lploanid }) => type === 'secure'
                  && lploanid === secureComponentOfSelectedLoan.loanid,
            ),
          ),
        );

        const newLoan = localGetters.newLoansDataOfLoanID(
          lpLoanIDofSelectedLoan,
          state.confirmedRenewalData.newLoansData,
        );

        if (!newLoan) return;

        setCommonRenewalData(selectedLoan, newLoan);

        if (
          state.confirmedRenewalData.selectionState[lpLoanIDofSelectedLoan]
            .renewalOption === RenewalOptions.MORE
        ) {
          secureComponentOfSelectedLoan.replegeAmtUpdated = true;
        }
      }

      if (
        state.confirmedRenewalData.selectionState[lpLoanIDofSelectedLoan]
          .type === SelectionType.LOAN_ENHANCEMENT
      ) {
        secureComponentOfSelectedLoan.isSelectedLELoan = true;

        secureComponentOfSelectedLoan.newLoan = _.cloneDeep(
          loanEnhancementDataTuple(
            lpLoanIDofSelectedLoan,
            state.confirmedRenewalData.loanEnhancementOptions,
            state.confirmedRenewalData.selectedLESchemeID,
          ),
        );

        const LEloan = _.cloneDeep(
          secureLoanEnhancementData(
            lpLoanIDofSelectedLoan,
            state.confirmedRenewalData.loanEnhancementOptions,
            state.confirmedRenewalData.selectedLESchemeID,
          ),
        );

        if (!LEloan) return;

        setCommonRenewalData(selectedLoan, LEloan);

        secureComponentOfSelectedLoan.topUpAmount = LEloan.loanEnhancement
          && LEloan.loanEnhancement.totalDisbursalAmount
          ? LEloan.loanEnhancement.totalDisbursalAmount
          : 0;
        secureComponentOfSelectedLoan.scheme = LEloan.scheme;

        secureComponentOfSelectedLoan.loanEnhancement = LEloan.loanEnhancement
          ? LEloan.loanEnhancement
          : {};

        secureComponentOfSelectedLoan.newLoan[1].loanEnhancement = LEloan.loanEnhancement
          ? LEloan.loanEnhancement
          : {};
      }
    });

    return selectedLoans;
  },

  newLoansData: (state) => state.newLoansData,

  confirmedNewLoansData: (state) => _.cloneDeep(state.confirmedRenewalData.newLoansData),

  loanEnhancementOptions: (state) => state.loanEnhancementOptions,

  loanSelectionStateOfLoanID: (state) => (loanid) => state.selectionState[loanid],

  loanIDsSelectedForRenewal(state) {
    return _.chain(state.selectionState)
      .pickBy((value) => !value || value.type === SelectionType.RENEWAL)
      .keys()
      .value();
  },

  getLoanBySecureComponentID(state, localGetters, rootState, rootGetters) {
    return rootGetters['loans/getLoanBySecureComponentID'];
  },

  loansSelectedForLE(state, localGetters) {
    const loanIDsSelectedForLE = _.chain(state.selectionState)
      .pickBy((value) => value && value.type === SelectionType.LOAN_ENHANCEMENT)
      .keys()
      .value();

    return loanIDsSelectedForLE.map((loanID) => localGetters.getLoanBySecureComponentID(loanID));
  },

  // newLoansDataParam is optional. If left empty,
  // this method will use the working newLoansData from the state.
  newLoansDataOfLoanID: (state) => (loanid, newLoansDataParam) => {
    let newLoansData;
    if (!newLoansDataParam) {
      newLoansData = state.newLoansData;
    } else {
      newLoansData = newLoansDataParam;
    }

    if (!loanid) return null;
    if (!newLoansData) return null;

    return newLoansData.loans
      .map((loanComponentTuple) => loanComponentTuple.find(({ type }) => type === 'secure'))
      .find(({ lploanid }) => lploanid === loanid);
  },

  isLoanIDEligibleForLE: (state, localGetters) => (lId) => localGetters.newLoansDataOfLoanID(lId)
    && localGetters.newLoansDataOfLoanID(lId).isEligibleForLoanEnhancement,

  isMoreRenewalAvailable: (state, localGetters) => (loanid) => {
    const loanComponentData = localGetters.newLoansDataOfLoanID(loanid);
    return (loanComponentData && loanComponentData.hasMore) || false;
  },
};

export const buildRenewalSchemeRequest = (
  loansInTheSelectedLoanGroup,
  selectedLoanIds,
) => {
  let totalloans = allSecureComponents(loansInTheSelectedLoanGroup).map(
    ({
      loanid, eligibleweight, uloanId, type,
    }) => ({
      loans: [{ loanid, eligibleweight }],
      uloanid: uloanId,
      type,
    }),
  );

  if (totalloans.every(({ type }) => type === 'N:1')) {
    totalloans = [
      { loans: totalloans.map(({ loans }) => loans[0]), type: 'N:1' },
    ];
  }

  let selectedloans = allSecureComponents(loansInTheSelectedLoanGroup)
    .filter(({ loanid }) => selectedLoanIds.includes(loanid))
    .map(({
      loanid, eligibleweight, uloanId, type,
    }) => ({
      loans: [{ loanid, eligibleweight }],
      uloanid: uloanId,
      type,
    }));

  if (selectedloans.every(({ type }) => type === 'N:1')) {
    selectedloans = [
      { loans: selectedloans.map(({ loans }) => loans[0]), type: 'N:1' },
    ];
  }

  return { totalloans, selectedloans };
};

// These functions are defined on an object so that they can be mocked.
export const helpers = {
  getSchemeForRenewal: async (selectedLoanGroupLoans, selectedLoanIds) => {
    const response = await getrenewalScheme(
      buildRenewalSchemeRequest(selectedLoanGroupLoans, selectedLoanIds),
    );
    return response.data.response.newSchemeSelected;
  },
  getNewLoanDetails: async (scheme, loans) => {
    const requestData = {
      scheme,
      loans: allSecureComponents(loans).map((loanComponent) => _.pick(loanComponent, ['loanid', 'coreid', 'eligibleweight'])),
    };

    try {
      return (await getNewLoanDetailsAPI(requestData)).data;
    } catch (error) {
      Vue.noty.error(error.response.data.error.error_message || error.response.data.UserMsg);
      return null;
    }
  },
  getLoanEnhancementOptionsAPI: async (loansForLE) => {
    if (loansForLE.length === 0) return [];

    const requestData = {
      loans: allSecureComponents(loansForLE).map((loanComponent) => _.pick(loanComponent, ['loanid', 'coreid', 'eligibleweight'])),
    };

    try {
      return (await getLoanEnhancementOptions(requestData)).data.options;
    } catch (error) {
      Vue.noty.error(error.response.data.UserMsg);
      return null;
    }
  },
};

const actions = {
  setCurrentLPLoanID({ commit }, newCurrentLPLoanID) {
    commit('setCurrentLPLoanID', newCurrentLPLoanID);
  },

  setSelectedLESchemeID({ commit }, newLESchemeID) {
    commit('setSelectedLESchemeID', newLESchemeID);
  },

  aadhaarVerificationStatus({ commit }, data) {
    commit('aadhaarVerificationStatus', data);
  },

  aadhaarInValidMessage({ commit }, data) {
    commit('aadhaarInValidMessage', data);
  },

  aadhaarOTPInValidMessage({ commit }, data) {
    commit('aadhaarOTPInValidMessage', data);
  },

  hasShowExitModal({ commit }, data) {
    commit('hasShowExitModal', data);
  },

  hasSetRenewalFlow({ commit }, data) {
    commit('hasSetRenewalFlow', data);
  },

  resetState({ commit }) {
    commit('resetState');
  },

  async loanAmountSelectionModalOpened(
    {
      dispatch, state, rootGetters, commit,
    },
    viewingSummaryScreen,
  ) {
    if (!state.currentLPLoanID) {
      commit(
        'setCurrentLPLoanID',
        secureComponent(rootGetters['loans/selectedLoans'][0]).loanid,
      );
    }
    dispatch('initialiseSelectionState', viewingSummaryScreen);
    await dispatch('fetchNewRenewalAndLEOptions');
  },

  initialiseSelectionState({ rootGetters, commit }, viewingSummaryScreen) {
    if (viewingSummaryScreen) {
      commit('copyConfirmedSelectionStateToSelectionState');
    } else {
      const lpLoanIDs = rootGetters['loans/selectedLoans']
        .flatMap((loan) => loan.loans)
        .filter(isSecureComponent)
        .map((loanComponent) => loanComponent.loanid);

      const newSelectionState = {};
      lpLoanIDs.forEach((id) => {
        newSelectionState[id] = null;
      });

      commit('setSelectionState', newSelectionState);
      commit('setSelectedLESchemeID', null);
      commit('setRenewalScheme', null);
      commit('clearConfirmedSelectionState');
    }
  },

  syncSelectionState({ state, getters: localGetters, commit }) {
    const defaultRenewalOption = {
      type: SelectionType.RENEWAL,
      renewalOption: RenewalOptions.DEFAULT,
    };

    const newSelectionState = _.mapValues(
      state.selectionState,
      (selection, lploanid) => {
        if (!selection) {
          return selection;
        }

        if (selection.type === SelectionType.RENEWAL) {
          if (selection.renewalOption === RenewalOptions.DEFAULT) { return selection; }

          if (localGetters.isMoreRenewalAvailable(lploanid)) return selection;

          return defaultRenewalOption;
        }

        return selection;
      },
    );
    commit('setSelectionState', newSelectionState);

    // if scheme ID is no longer available inside loan enhancement options,
    // then set the scheme ID to schemeID of largest loan enhancement index available.as
    const availableSchemeIds = state.loanEnhancementOptions.map(
      (option) => option.scheme.id,
    );
    const isCurrentSchemeIDAvailable = availableSchemeIds.includes(
      state.selectedLESchemeID,
    );

    if (!isCurrentSchemeIDAvailable) {
      commit(
        'setSelectedLESchemeID',
        availableSchemeIds[availableSchemeIds.length - 1],
      );
    }

    // auto select default Renewal Option when more renewal option
    // and loan enhancement options are not available.
    if (
      state.currentLPLoanID
      && !localGetters.isMoreRenewalAvailable(state.currentLPLoanID)
      && !localGetters.isLoanIDEligibleForLE(state.currentLPLoanID)
    ) {
      commit('setSelectionStateOfLoanID', {
        loanid: state.currentLPLoanID,
        value: defaultRenewalOption,
      });
    }
  },

  async fetchNewRenewalAndLEOptions({
    rootGetters,
    commit,
    getters: localGetters,
    dispatch,
    state,
  }) {
    const selectedLoanGroup = rootGetters['loans/allLoans'].find((loanGroup) => loanGroup.loans.some((loan) => loan.isSelected));

    const loanIdsSelectedForRenewal = new Set([
      ...localGetters.loanIDsSelectedForRenewal,
    ]);

    if (state.currentLPLoanID) { loanIdsSelectedForRenewal.add(state.currentLPLoanID); }

    if (loanIdsSelectedForRenewal.size > 0) {
      const renewalScheme = await helpers.getSchemeForRenewal(
        selectedLoanGroup.loans,
        [...loanIdsSelectedForRenewal],
      );
      commit('setRenewalScheme', renewalScheme);

      const newLoansData = await helpers.getNewLoanDetails(
        renewalScheme,
        [...loanIdsSelectedForRenewal].map((lID) => localGetters.getLoanBySecureComponentID(lID)),
      );
      commit('setNewLoansData', newLoansData);
    } // else {
    //   commit("setRenewalScheme", null);
    //   commit("setNewLoansData", null);
    // }
    const payload = [...localGetters.loansSelectedForLE];
    if (localGetters.isLoanIDEligibleForLE(state.currentLPLoanID)) {
      payload.push(
        localGetters.getLoanBySecureComponentID(state.currentLPLoanID),
      );
    }
    const loanEnhancementOptions = await helpers.getLoanEnhancementOptionsAPI(
      payload,
    );
    commit('setLoanEnhancementOptions', loanEnhancementOptions);

    dispatch('syncSelectionState');
  },

  setSelectionStateOfLoanID({ commit }, { loanid, value }) {
    commit('setSelectionStateOfLoanID', { loanid, value });
  },

  viewNextLoan({
    rootGetters, commit, getters: localGetters, dispatch,
  }) {
    const nextLoan = rootGetters['loans/selectedLoans'][localGetters.currentLoanIndex + 1];
    commit('setCurrentLPLoanID', secureComponent(nextLoan).loanid);
    dispatch('fetchNewRenewalAndLEOptions');
  },

  viewPreviousLoan({
    rootGetters, commit, getters: localGetters, dispatch,
  }) {
    const previousLoan = rootGetters['loans/selectedLoans'][localGetters.currentLoanIndex - 1];
    commit('setCurrentLPLoanID', secureComponent(previousLoan).loanid);
    dispatch('fetchNewRenewalAndLEOptions');
  },

  async confirmModalSelection({ dispatch, commit }) {
    commit('setCurrentLPLoanID', null);
    await dispatch('fetchNewRenewalAndLEOptions');
    commit('confirmRenewalData');
  },
};

export default {
  namespaced: true,
  state: states,
  getters,
  actions,
  mutations,
};
