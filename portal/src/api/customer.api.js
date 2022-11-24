import axios from 'axios';
import constants from '../constant';

axios.defaults.timeout = 60000;

const getCustomerInfo = async () => {
  const response = await axios.get(`${constants.apiEndpoints.cisHostAPI}${constants.urls.customerInfo}`);
  return response;
};

const getCustomerLoans = async (filter) => {
  const response = await axios.get(`${constants.apiEndpoints.loansHostAPI}/api/v5/loans${filter ? `?repayment_type=${filter}` : ''}`);
  return response;
};

const getPaymentMethods = async (requestObj) => {
  const response = await axios.post(`${constants.apiEndpoints.payHostAPI}${constants.urls.paymentMethodsAPI}`,
    requestObj);
  return response;
};

const sendVanSMS = async (requestObj) => {
  const response = await axios.post(`${constants.apiEndpoints.loansHostAPI}${constants.urls.sendvansms}`,
    requestObj);
  return response;
};

const partPaymentSplit = async (requestObj) => {
  const response = await axios.post(`${constants.apiEndpoints.payHostAPI}${constants.urls.partPaymentSplitUrl}`,
    requestObj);
  return response;
};

const getDiscrepancyMessage = async () => {
  const response = await axios.get(`${constants.apiEndpoints.loansHostAPI}${constants.urls.getDiscrepancyMessage}`);
  return response;
};

const getPaymentOptionsForOrderID = async (orderId) => {
  const response = await axios.get(`${constants.apiEndpoints.losHostAPI}${constants.urls.getPaymentOptionsAPI}?orderId=${orderId}`);
  return response;
};

const getQuickLinks = async () => {
  const response = await axios.get(`${constants.apiEndpoints.loansHostAPI}${constants.urls.getQuickLinks}`);
  return response;
};

const getAdditionalChargesAPI = async (lmsIds) => {
  const response = await axios.get(`${constants.apiEndpoints.loansHostAPI}${constants.urls.additionalChargesAPI}?lmsIds=${lmsIds}`);
  return response;
};

export {
  getCustomerInfo,
  getCustomerLoans,
  sendVanSMS,
  partPaymentSplit,
  getDiscrepancyMessage,
  getPaymentMethods,
  getPaymentOptionsForOrderID,
  getQuickLinks,
  getAdditionalChargesAPI,
};
