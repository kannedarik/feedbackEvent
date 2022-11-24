import axios from 'axios';
import constants from '../constants';
import getEnv from '../utility/env';

const baseURLPay = `${getEnv('VUE_APP_KONG_URL')}/${getEnv('VUE_APP_PAY_HOST')}`;
const baseURLTransfers = `${getEnv('VUE_APP_KONG_URL')}/${getEnv('VUE_APP_HOST')}`;
// const baseURLTransfers = `${getEnv('VUE_APP_KONG_URL')}/staging`;

const getcustomerloans = async (data) => {
  const response = await axios.post(`${baseURLPay}${constants.urls.getcustomerloans}`, data);
  return response;
};

const validatingLoans = async (data) => {
  const response = await axios.post(`${baseURLPay}${constants.urls.validatingLoans}`, data);
  return response;
};

const updatePaymentCustomer = async (data) => {
  const response = await axios.post(`${baseURLPay}${constants.urls.updatePaymentCustomer}`, data);
  return response;
};

const getUnsuccesfulTransfers = async (data) => {
  const response = await axios.post(`${baseURLTransfers}${constants.urls.getUnsuccesfulTransfers}`, data);
  return response;
};

const getPaymentsfetch = async (data) => {
  const response = await axios.post(`${baseURLPay}${constants.urls.paymentsfetch}`, data);
  return response;
};

const getUnlinkedVanPayment = async (data) => {
  const response = await axios.post(`${baseURLTransfers}${constants.urls.getUnlinkedVanPayment}`, data);
  return response;
};

const getTempVanPayment = async (data) => {
  const response = await axios.post(`${baseURLTransfers}${constants.urls.getTempVanPayment}`, data);
  return response;
};

const checkUserLoans = async (data) => {
  const response = await axios.post(`${baseURLPay}${constants.urls.checkUserLoanAttributable}`, data);
  return response;
};

const createMultiLenderTransfers = async (data) => {
  const response = await axios.post(`${baseURLTransfers}${constants.urls.createMultiLenderTransfers}`, data);
  return response;
};

const getPaymentStageInfo = async (data) => {
  const response = await axios.get(`${baseURLPay}${constants.urls.getPaymentStageInfo}`, {
    params: {
      requestid: data.requestid,
      stage: data.stage,
    },
  });
  return response;
};

export {
  getcustomerloans, getUnsuccesfulTransfers, validatingLoans,
  updatePaymentCustomer, getPaymentsfetch, getUnlinkedVanPayment,
  getTempVanPayment, checkUserLoans, createMultiLenderTransfers, getPaymentStageInfo,
};
