/* eslint-disable no-param-reassign */

// initial state
const state = {
  loadingMessage: false,
  loaderCount: 0,
};

// getters
const getters = {
  isLoading() {
    return state.loaderCount > 0;
  },
  isLoadingMessage() {
    return state.loadingMessage;
  },
};

// actions
const actions = {
  setLoading({ commit }, status) {
    commit('setLoading', status);
  },
  clearLoading({ commit }) {
    commit('clearLoading');
  },
  stopLoading({ commit }) {
    commit('stopLoading');
  },
};

// mutations
const mutations = {
  setLoading(store, status) {
    store.loaderCount += 1;
    store.loadingMessage = status.esign;
  },
  clearLoading(store) {
    if (store.loaderCount > 0) {
      store.loaderCount -= 1;
    }
  },
  stopLoading(store) {
    store.loadingMessage = false;
    store.loaderCount = 0;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
