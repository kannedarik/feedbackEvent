import { lenders, getLenderPartners } from '@/api/data.api';

// initial state
const state = {
  lenders: [],
  lenderOptions: [],
};

// getters
const getters = {
  listLenders: store => store.lenders,
  getLenderOptions: store => store.lenderOptions,
};

// actions
const actions = {
  async lenders({ commit }) {
    const response = await lenders();
    commit('setLenders', response.data.lenders);
  },
  async getLenderOptions({ commit }) {
    const response = await getLenderPartners();
    commit('setLenderOptions', response.data.data);
  },
};

// mutations
const mutations = {
  setLenders(store, payload) {
    store.lenders = payload;
  },
  setLenderOptions(store, payload) {
    const lenderInfo = [];
    payload.forEach((lender) => {
      const value = lender.slug !== 'icici-bank' ? lender.slug : 'icici';
      lenderInfo.push({
        name: lender.displayNames.shortName,
        value,
      });
    });
    store.lenderOptions = lenderInfo;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
