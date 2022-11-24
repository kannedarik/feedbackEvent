/* eslint-disable no-param-reassign */

// initial state
const state = {
  loading: false,
};

// getters
const getters = {
  isLoading() {
    return state.loading;
  },
};

// actions
const actions = {
  setLoading({ commit }, status) {
    commit('setLoading', status);
  },
};

// mutations
const mutations = {
  setLoading(store, status) {
    store.loading = status;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
