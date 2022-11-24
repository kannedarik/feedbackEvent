// initial state
const initialState = () => ({
  addressDetails: null,
  orderIdsList: [],
  selectedAddress: {},
  hasRescheduleSlotBooking: false,
  gmapAddress: null,
  currentOrderId: '',
  resetslotBooking: {
    reset: false,
    resetAll: false,
    resetReleaseTracker: false,
  },
  orderCityInfo: {},
});
// initial state
const states = initialState();

// getters
const getters = {
  addressDetails: (store) => store.addressDetails,
  orderIdsList: (store) => store.orderIdsList,
  selectedAddress: (store) => store.selectedAddress,
  hasRescheduleSlotBooking: (store) => store.hasRescheduleSlotBooking,
  gmapAddress: (store) => store.gmapAddress,
  currentOrderId: (store) => store.currentOrderId,
  resetslotBooking: (store) => store.resetslotBooking,
  orderCityInfo: (store) => store.orderCityInfo,
};
// actions
const actions = {
  async customerAddressInfo({ commit }, payload) {
    commit('customerAddressInfo', payload);
  },
  async orderIdsList({ commit }, payload) {
    commit('orderIdsList', payload);
  },
  async updateOrderIdsList({ commit }, payload) {
    commit('updateOrderIdsList', payload);
  },
  async setSelectedAddress({ commit }, payload) {
    commit('setSelectedAddress', payload);
  },
  async setRescheduleSlotBooking({ commit }, payload) {
    commit('setRescheduleSlotBooking', payload);
  },
  async setGmapAddress({ commit }, payload) {
    commit('setGmapAddress', payload);
  },
  async setCurrentOrderId({ commit }, payload) {
    commit('setCurrentOrderId', payload);
  },
  async updatePinCode({ commit }, payload) {
    commit('updatePinCode', payload);
  },
  async setResetslotBooking({ commit }, payload) {
    commit('setResetslotBooking', payload);
  },
  resetState: ({ commit }) => {
    commit('resetState');
  },
  async orderCityInfo({ commit }, payload) {
    commit('orderCityInfo', payload);
  },
};
// mutations
const mutations = {
  customerAddressInfo(state, payload) {
    state.addressDetails = payload;
  },
  setSelectedAddress(state, payload) {
    state.selectedAddress = payload;
  },
  orderIdsList(state, payload) {
    state.orderIdsList = payload;
  },
  setRescheduleSlotBooking(state, payload) {
    state.hasRescheduleSlotBooking = payload;
  },
  setGmapAddress(state, payload) {
    state.gmapAddress = payload;
  },
  setCurrentOrderId(state, payload) {
    state.currentOrderId = payload;
  },
  setResetslotBooking(state, payload) {
    state.resetslotBooking = payload;
  },
  updateOrderIdsList(state, payload) {
    state.orderIdsList.map((order) => {
      const currentOrder = order;
      if (!currentOrder.isCompleted) {
        currentOrder.isCompleted = currentOrder.orderId === payload;
      }
      return currentOrder;
    });
  },
  updatePinCode(state, payload) {
    state.gmapAddress.pincode = payload;
  },
  resetState(state) {
    Object.assign(state, initialState());
  },
  orderCityInfo(state, payload) {
    state.orderCityInfo = payload;
  },
};
export default {
  namespaced: true,
  state: states,
  getters,
  actions,
  mutations,
};
