/* eslint-disable no-underscore-dangle */
import findIndex from 'lodash/findIndex';
import { listProcessor, createProcessor } from '../../api/processor.api';

// initial state
const state = {
  totalDocs: 0,
  processors: [],
};

// getters
const getters = {
  listProcessors: store => store.processors,
  totalDocs: store => store.totalDocs,
};

// actions
const actions = {
  async list({ commit }, { page, limit }) {
    const response = await listProcessor(page, limit);
    commit('setProcessors', response.data.result);
  },
  async create({ commit }, data) {
    const response = await createProcessor({ ...data, file: data.file._id });
    commit('addProcessor', { ...response.data.processor, file: data.file });
  },
  async edit({ commit }, data) {
    commit('updateProcessor', data);
  },
};

// mutations
const mutations = {
  setProcessors(store, payload) {
    store.processors = payload.docs;
    store.totalDocs = payload.totalDocs;
  },
  addProcessor(store, payload) {
    store.processors.unshift(payload);
    store.totalDocs += 1;
  },
  updateProcessor(store, payload) {
    const index = findIndex(store.processors, { _id: payload._id });
    if (index >= 0) {
      store.processors.splice(index, 1, { ...store.processors[index], ...payload });
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
