import axios from 'axios';
import constants from '@/constant';

const paymentsHostAPIs = constants.apiEndpoints.payHostAPI;
const omsAPIs = constants.apiEndpoints.omsHostAPI;
const referralHostAPI = constants.apiEndpoints.ReferralHostAPI;

const fetchOrderId = async (data) => {
  const response = await axios.post(`${omsAPIs}${constants.urls.fetchOrderId}`, data);
  return response;
};
const resendOtpToCustomer = async (orderID, data) => {
  const response = await axios.put(`${omsAPIs}${constants.urls.fetchOrder}/${orderID}/digisign/otp`, data);
  return response;
};
const verifyOtp = async (orderID, data) => {
  const response = await axios.put(`${omsAPIs}${constants.urls.fetchOrder}/${orderID}/digisign/verify`, data);
  return response;
};
const registerSignMethodBasedOnOrderId = async (orderId, data) => {
  const response = await axios.put(`${omsAPIs}${constants.urls.fetchOrder}/${orderId}${constants.urls.fetchSignMethods}`, data);
  return response;
};
const fetchSignMethodsBasedOnOrderIdStatusCard = async (data) => {
  const response = await axios.get(`${omsAPIs}${constants.urls.fetchOrder}/${data.orderId}${constants.urls.fetchSignMethods}${data.source ? data.source : ''}`);
  return response;
};
const fetchSignMethodsBasedOnOrderId = async (data) => {
  axios.defaults.headers.common.Authorization = `JWT ${localStorage.getItem('jwt') ? localStorage.getItem('jwt') : null}`;
  const response = await axios.get(`${omsAPIs}${constants.urls.fetchOrder}/${data}${constants.urls.fetchSignMethods}`);
  return response;
};
const getUnsignedDocument = async (orderId) => {
  const response = await axios.get(`${omsAPIs}${constants.urls.viewDocument}/${orderId}/document`);
  return response;
};
const getSignedDocument = async (orderId) => {
  const response = await axios.get(`${omsAPIs}${constants.urls.fetchOrder}/${orderId}/signeddocuments`);
  return response;
};
const fetchEsignLinks = async (orderId) => {
  const response = await axios.get(`${omsAPIs}${constants.urls.fetchOrder}/${orderId}/esign`);
  return response;
};
const getorderDetails = async (orderId) => {
  const response = await axios.get(`${omsAPIs}${constants.urls.fetchOrder}/${orderId}`);
  return response;
};
const getCustomerBankDetails = async () => {
  const response = await axios.get(`${omsAPIs}${constants.urls.getCustomerBankDetails}`);
  return response;
};

const updateCustomerBankDetails = async (data) => {
  const response = await axios.post(`${omsAPIs}${constants.urls.getCustomerBankDetails}/init`, data);
  return response;
};
const resendOtpVerifiyAccount = async (data) => {
  const response = await axios.get(`${omsAPIs}${constants.urls.resendOtpToCustomer}/${data.transactionId}/resend?type=${data.type}`);
  return response;
};

const checkVerificationStatus = async (transactionId) => {
  const response = await axios.get(`${omsAPIs}${constants.urls.resendOtpToCustomer}/${transactionId}/status`);
  return response;
};
const verifiyAccountAPI = async (transactionId, otp) => {
  const response = await axios.post(`${omsAPIs}${constants.urls.resendOtpToCustomer}/${transactionId}/verify`, otp);
  return response;
};
const getrenewalScheme = async (data) => {
  const response = await axios.post(`${paymentsHostAPIs}${constants.urls.getRenewalSchemes}?schemeSource=schemeengine`, data);
  return response;
};
const disablingRenewalCovidAPI = async (data) => {
  const response = await axios.get(`${referralHostAPI}${constants.urls.operationAlmetricsAPI}?coreids=${data}`);
  return response;
};
const getLoanEnhancementOptions = async (data) => {
  const response = await axios.post(`${referralHostAPI}${constants.urls.loanEnhancementOptions}`, data);
  return response;
};
const getNewLoanDetailsAPI = async (data) => {
  const response = await axios.post(`${referralHostAPI}${constants.urls.getNewLoan}`, data);
  return response;
};
const renewalEligibilityAPI = async (data) => {
  const response = await axios.post(`${paymentsHostAPIs}${constants.urls.renewalEligibility}`, data);
  return response;
};
const aadharValidationWithOrderID = async (orderId, data) => {
  const response = await axios.post(`${omsAPIs}${constants.urls.fetchOrder}/${orderId}/validateaadhar`, data);
  return response;
};
const getAadharValidationWithOrderID = async (orderId) => {
  const response = await axios.get(`${omsAPIs}${constants.urls.fetchOrder}/${orderId}/validateaadhar`);
  return response;
};
const pinVerificationWithOrderID = async (orderId) => {
  const response = await axios.post(`${omsAPIs}${constants.urls.fetchOrder}/${orderId}/pinverification`);
  return response;
};
export {
  fetchOrderId, resendOtpToCustomer, verifyOtp, registerSignMethodBasedOnOrderId,
  fetchSignMethodsBasedOnOrderId, getUnsignedDocument, getSignedDocument, fetchEsignLinks,
  getorderDetails, getCustomerBankDetails, updateCustomerBankDetails,
  resendOtpVerifiyAccount, verifiyAccountAPI, checkVerificationStatus,
  getrenewalScheme, disablingRenewalCovidAPI, getNewLoanDetailsAPI, getLoanEnhancementOptions,
  renewalEligibilityAPI, fetchSignMethodsBasedOnOrderIdStatusCard,
  aadharValidationWithOrderID, pinVerificationWithOrderID, getAadharValidationWithOrderID,
};
