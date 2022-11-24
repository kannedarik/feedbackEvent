// initial state
const initialState = () => ({
  selectedAccount: null,
});

// initial state
const states = initialState();

// getters
const getters = {
  selectedAccount: (store) => store.selectedAccount,
};
// actions
const actions = {
  setSelectedAccount: ({ commit }, payload) => {
    commit('setSelectedAccount', payload);
  },
  resetState: ({ commit }) => {
    commit('resetState');
  },
};
// mutations
const mutations = {
  setSelectedAccount(store, payload) {
    const temp = store;
    temp.selectedAccount = payload;
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
