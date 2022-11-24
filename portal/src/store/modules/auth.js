/* eslint-disable no-param-reassign */
// import axios from 'axios';
import { login, logout } from '@/api/auth.api';
import getEnv from '@/utils/env';

const isLoggedIn = localStorage.getItem('isLoggedIn') ? localStorage.getItem('isLoggedIn') : false;

// initial state
const state = {
  token: window.$cookies.get('jwt') ? window.$cookies.get('jwt') || null : null,
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  pinToken: localStorage.getItem('token') ? localStorage.getItem('token') || null : null,
  isAuthenticated: !!window.$cookies.get('jwt') && isLoggedIn,
};

// getters
const getters = {
  isAuthenticated: (store) => !!store.token && isLoggedIn,
  authToken: (store) => store.token,
  pinToken: (store) => store.pinToken,
  loggedInUser: (store) => store.user,
};

// actions
const actions = {
  async login({ commit }, data) {
    const response = await login(data);
    window.$cookies.set('jwt', response.data.token, null, null, getEnv('VUE_APP_DOMAIN'));
    const {
      leadId, firstname, lastname, phone, email, isPinSet,
    } = response.data.user;
    localStorage.setItem('user', JSON.stringify({
      refid: leadId, firstname, lastname, phone, email, isPinSet,
    }));
    commit('login', {
      token: response.data.token,
      user: response.data.user,
    });
    return response;
  },
  async logout({ commit }) {
    const response = await logout();
    window.$cookies.remove('jwt', null, getEnv('VUE_APP_DOMAIN'));
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    commit('logout');
    return response;
  },
  async tempLogin({ commit }, response) {
    if (response && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    let user = {};
    if (response && response.data.user) {
      user = response.data.user;
      const {
        leadId, firstname, lastname, phone, email, isPinSet,
      } = response.data.user;
      localStorage.setItem('user', JSON.stringify({
        refid: leadId, firstname, lastname, phone, email, isPinSet,
      }));
    } else {
      user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    }
    const token = window.$cookies.get('jwt');
    const pinToken = localStorage.getItem('token') ? localStorage.getItem('token') : null;
    const hasSetPIN = localStorage.getItem('isLoggedIn') ? localStorage.getItem('isLoggedIn') : false;
    commit('login', {
      token,
      user,
      pinToken,
      hasSetPIN,
    });
  },
  tempLogout({ commit }) {
    window.$cookies.remove('jwt', null, getEnv('VUE_APP_DOMAIN'));
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    commit('logout');
  },
};

// mutations
const mutations = {
  login(store, payload) {
    store.token = payload.token;
    store.user = payload.user;
    store.pinToken = payload.pinToken;
    store.isAuthenticated = !!payload.token && payload.hasSetPIN;
  },
  logout(store) {
    store.token = null;
    store.user = null;
    store.pinToken = null;
    store.isAuthenticated = null;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
