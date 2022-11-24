import { getQuickLinks } from '@/api/customer.api';

// initial state
const initialState = () => ({
  quickLinkSelected: 'all',
  quickLinks: [],
  quickLinkDispaly: 'Manage Loans',
  quickLinksInfo: {},
});
// initial state
const states = initialState();
// getters
const getters = {
  quickLinkSelected: (store) => store.quickLinkSelected,
  quickLinks: (store) => store.quickLinks,
  quickLinkDispaly: (store) => store.quickLinkDispaly,
  quickLinksInfo: (store) => store.quickLinksInfo,
};
// actions
const actions = {
  async setQuickLinkSelected({ commit }, payload) {
    commit('setQuickLinkSelected', payload);
  },
  async upDateQuickLinks({ commit }, payload) {
    commit('upDateQuickLinks', payload);
  },
  async setQuickLinkDispaly({ commit }, payload) {
    commit('setQuickLinkDispaly', payload);
  },
  async fetchQuickLinks({ commit }) {
    const response = await getQuickLinks();
    commit('setQuickLinksInfo', response.data);
  },
  resetState: ({ commit }) => {
    commit('resetState');
  },
};
// mutations
const mutations = {
  setQuickLinkSelected(state, payload) {
    state.quickLinkSelected = payload;
  },
  upDateQuickLinks(state, payload) {
    state.quickLinks = payload;
  },
  setQuickLinkDispaly(state, payload) {
    state.quickLinkDispaly = payload;
  },
  setQuickLinksInfo(state, payload) {
    state.quickLinksInfo = payload;
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
