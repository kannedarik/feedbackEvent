import axios from 'axios';
import constants from '../constant';

const paymentsHostAPIs = constants.apiEndpoints.payHostAPI;
const releasePodAPIs = constants.apiEndpoints.losHostAPI;

const getPaymentLink = async (data) => {
  const response = await axios.post(`${paymentsHostAPIs}${constants.urls.getPaymentLink}`, data);
  return response;
};

const getPaymentDetails = async (authType, paymentId) => {
  let apiURL = '';
  if (authType) {
    apiURL = `${paymentsHostAPIs}${constants.urls.getPaymentDetails}${paymentId}`;
  } else {
    apiURL = `${constants.urls.getPaymentDetailsWithAuth}${paymentId}`;
  }
  const response = await axios.get(apiURL);
  return response;
};

const getPaymentDetailsV2 = async (authType, paymentId) => {
  let apiURL = '';
  if (authType) {
    apiURL = `${paymentsHostAPIs}${constants.urls.getPaymentDetails}${paymentId}`;
  } else {
    apiURL = `${paymentsHostAPIs}${constants.urls.getPaymentDetailsWithAuthV2}${paymentId}`;
  }
  const response = await axios.get(apiURL);
  return response;
};

const getPaymentSuccessDetails = async (provider, requestObj) => {
  const response = await axios.post(`${constants.urls.getPaymentSuccessError}${provider}/status`, requestObj);
  return response;
};

const getPartReleasePaymentsLinkForOrderId = async (orderId) => {
  const response = await axios.get(`${releasePodAPIs}${constants.urls.getPartReleasePaymentsLinkAPI}?orderId=${orderId}`);
  return response;
};

const getLoanDetailForRequestId = async (requestId) => {
  const response = await axios.get(`${paymentsHostAPIs}${constants.urls.loanDetailForRequestIdAPI}?requestid=${requestId}`);
  return response;
};

export {
  getPaymentLink,
  getPaymentDetails,
  getPaymentDetailsV2,
  getPaymentSuccessDetails,
  getPartReleasePaymentsLinkForOrderId,
  getLoanDetailForRequestId,
};
