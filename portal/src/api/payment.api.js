import axios from 'axios';
import constants from '../constant';
import getEnv from '../utils/env';

const getPaymentMethods = async (orderId) => {
  const response = await axios.get(`${getEnv('VUE_APP_API_GATEWAY_URI')}/${getEnv('VUE_APP_OMS_HOST')}${constants.urls.fetchOrder}/${orderId}${constants.urls.paymentMethods}?includes=order`);
  return response;
};
const getorderStatus = async (orderId) => {
  const response = await axios.get(`${getEnv('VUE_APP_API_GATEWAY_URI')}/${getEnv('VUE_APP_OMS_HOST')}${constants.urls.fetchOrder}/${orderId}?poll=true`);
  return response;
};
const sendVanSMS = async (data) => {
  const response = await axios.post(`${getEnv('VUE_APP_API_GATEWAY_URI')}/${getEnv('VUE_APP_PAY_HOST')}${constants.urls.sendvansms}`, data);
  return response;
};
const getRpkId = async (orderId) => {
  const response = await axios.put(`${getEnv('VUE_APP_API_GATEWAY_URI')}/${getEnv('VUE_APP_OMS_HOST')}${constants.urls.fetchOrder}/${orderId}${constants.urls.payment}`, { retry: true });
  return response;
};
const getPaymentDetails = async (authType, paymentId) => {
  let apiURL = '';
  if (authType) {
    apiURL = `${getEnv('VUE_APP_API_GATEWAY_URI')}/${getEnv('VUE_APP_PAY_HOST')}${constants.urls.getPaymentDetails}${paymentId}`;
  } else {
    apiURL = `${getEnv('VUE_APP_PAYMENTS_URL')}${constants.urls.getPaymentDetailsWithAuth}${paymentId}`;
  }
  const response = await axios.get(apiURL);
  return response;
};
export {
  getPaymentMethods, getorderStatus, sendVanSMS, getRpkId, getPaymentDetails,
};
