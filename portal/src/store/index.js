import Vue from 'vue';
import Vuex from 'vuex';
import auth from './modules/auth';
import loader from './modules/loader';
import data from './modules/data';
import loans from './modules/loans';
/* eslint import/no-cycle: [2, { maxDepth: 1 }] */
import jewels from './modules/jewels';
import renewal from './modules/renewal';
import releaseSlotBooking from './modules/releaseSlotBooking';
import quickLinks from './modules/quickLinks';
import getEnv from '../utils/env';

Vue.use(Vuex);
const debug = getEnv('NODE_ENV') !== 'production';

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    auth,
    data,
    loans,
    jewels,
    releaseSlotBooking,
    loader,
    renewal,
    quickLinks,
  },
  strict: debug,
});
