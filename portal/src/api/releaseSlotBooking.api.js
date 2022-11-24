import axios from 'axios';
import constants from '../constant';

const getCustomerAddressInfoAPI = async (data) => {
  const response = await axios.get(`${constants.apiEndpoints.cisHostAPI}/customerinfo/${data}`);
  return response;
};

const addNewAddressAPI = async (customerID, data) => {
  const response = await axios.post(`${constants.apiEndpoints.cisHostAPI}/lead/${customerID}/address`, data);
  return response;
};

const customerAddressValidationAPI = async (pincode) => {
  const response = await axios.get(`${constants.apiEndpoints.losHostAPI}${constants.urls.AddressValidationAPI}?pincode=${pincode}`);
  return response;
};

const getSlotsDatesAPI = async (orderId) => {
  const response = await axios.get(`${constants.apiEndpoints.losHostAPI}${constants.urls.getSlotsDates}/dates/${orderId}`);
  return response;
};

const getSlotsAPI = async (data) => {
  const response = await axios.get(`${constants.apiEndpoints.losHostAPI}${constants.urls.getSlotsDates}`, { params: data });
  return response;
};

const confirmSlotAPI = async (data) => {
  const response = await axios.post(`${constants.apiEndpoints.losHostAPI}${constants.urls.updateOrderDetails}`, data);
  return response;
};

const getStaticMessageAPI = async (data) => {
  const response = await axios.get(`${constants.apiEndpoints.losHostAPI}${constants.urls.staticMessageAPI}?${data}`);
  return response;
};

const addressUpdateAPI = async (data) => {
  const response = await axios.post(`${constants.apiEndpoints.losHostAPI}${constants.urls.addressUpdateAPI}`, data);
  return response;
};

export {
  getCustomerAddressInfoAPI,
  addNewAddressAPI,
  customerAddressValidationAPI,
  getStaticMessageAPI,
  getSlotsDatesAPI,
  getSlotsAPI,
  confirmSlotAPI,
  addressUpdateAPI,
};
