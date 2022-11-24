import Vue from 'vue';
import Vuex from 'vuex';

/* ----------  Modules  ---------- */
import auth from './modules/auth';
import data from './modules/data';
import loader from './modules/loader';
import processor from './modules/processor';
import getEnv from '../utility/env';

Vue.use(Vuex);

const debug = getEnv('NODE_ENV') !== 'production';

export default new Vuex.Store({
  modules: {
    auth,
    data,
    loader,
    processor,
  },
  strict: debug,
});
