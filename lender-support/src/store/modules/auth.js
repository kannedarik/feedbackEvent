import map from 'lodash/map';
import login from '../../api/auth.api';

// initial state
const state = {
  token: localStorage.getItem('jwt') || null,
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
};

// getters
const getters = {
  isAuthenticated: store => !!store.token,
  authToken: store => store.token,
  loggedInUser: store => store.user,
};

// actions
const actions = {
  async login({ commit }, data) {
    const response = await login(data);
    commit('login', {
      token: response.data.token,
      user: {
        ...response.data.user,
        roles: map(response.data.user.roles, role => role.name),
      },
    });
  },
  logout({ commit }) {
    commit('logout');
  },
};

// mutations
const mutations = {
  login(store, payload) {
    store.token = payload.token;
    store.user = payload.user;

    localStorage.setItem('jwt', payload.token);
    localStorage.setItem('user', JSON.stringify(payload.user));
  },
  logout(store) {
    store.token = null;
    store.user = null;

    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
