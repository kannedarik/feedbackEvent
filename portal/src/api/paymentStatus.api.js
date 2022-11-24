import axios from 'axios';
import constants from '../constant';

const paymentsHostAPIs = constants.apiEndpoints.payHostAPI;
const omsAPIs = constants.apiEndpoints.omsHostAPI;

const getpaymentFinalStatus = async (requestId) => {
  const response = await axios.get(`${paymentsHostAPIs}${constants.urls.getPaymentFinalStatusAPI}?requestid=${requestId}`);
  return response;
};
const getOrderId = async (rpkid) => {
  const response = await axios.get(`${omsAPIs}${constants.urls.getOmsId}/${rpkid}`);
  return response;
};
const getorderStatus = async (orderid) => {
  const response = await axios.get(`${omsAPIs}/api/v1/orders/renewals/${orderid}`);
  return response;
};

const getLoanDetailForRequestId = async (requestId) => {
  const response = await axios.get(`${paymentsHostAPIs}${constants.urls.loanDetailForRequestIdAPI}?requestid=${requestId}`);
  return response;
};

export {
  getpaymentFinalStatus,
  getOrderId,
  getorderStatus,
  getLoanDetailForRequestId,
};
