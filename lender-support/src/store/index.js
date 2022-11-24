import Vue from 'vue';
import Vuex from 'vuex';
import auth from './modules/auth';
import loader from './modules/loader';

Vue.use(Vuex);
const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    auth,
    loader,
  },
  strict: debug,
});
