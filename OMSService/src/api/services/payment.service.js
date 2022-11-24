const axios = require('axios');
const httpStatus = require('http-status');
const APIError = require('../utils/APIError');
const { services } = require('../../config/vars');
const { getBasicAuthString } = require('../utils/helper');
const { supportJwtToken } = require('../../config/vars');

exports.getPaymentOptions = async (token, data) => {
  const options = {
    url: `${services.payment.endpoint}${services.payment.getPaymentOptions}`,
    method: 'POST',
    headers: {
      Authorization: `JWT ${token}`,
    },
    data,
  };

  try {
    const response = await axios(options);
    return response.data;
  } catch (e) {
    throw new APIError({
      status: (e.response ? e.response.status : httpStatus.INTERNAL_SERVER_ERROR),
      message: ((e.response && e.response.data) ? (e.response.data.ErrorMsg || e.response.data.UserMsg) : e.message), // eslint-disable-line max-len
    });
  }
};

exports.getPaymentLink = async (token, data) => {
  const options = {
    url: `${services.payment.endpoint}${services.payment.getPaymentLink}`,
    method: 'POST',
    headers: {
      Authorization: `JWT ${token}`,
    },
    data,
  };

  try {
    const response = await axios(options);
    return response.data;
  } catch (e) {
    throw new APIError({
      status: (e.response ? e.response.status : httpStatus.INTERNAL_SERVER_ERROR),
      message: ((e.response && e.response.data) ? (e.response.data.ErrorMsg || e.response.data.UserMsg) : e.message), // eslint-disable-line max-len
    });
  }
};

exports.getPaymentStatus = async (token, requestid) => {
  const options = {
    url: `${services.payment.endpoint}${services.payment.getPaymentStatus}`,
    method: 'GET',
    params: {
      requestid,
    },
    headers: {
      Authorization: `JWT ${supportJwtToken}`,
    },
  };

  const response = await axios(options);
  return response.data;
};

exports.createRenewalVan = async (token, data) => {
  const options = {
    url: `${services.payment.endpoint}${services.payment.createRenewalVan}`,
    method: 'POST',
    headers: {
      Authorization: `JWT ${token}`,
    },
    data,
  };

  try {
    const response = await axios(options);
    return response.data;
  } catch (e) {
    throw new APIError({
      status: (e.response ? e.response.status : httpStatus.INTERNAL_SERVER_ERROR),
      message: ((e.response && e.response.data) ? (e.response.data.ErrorMsg || e.response.data.UserMsg) : e.message), // eslint-disable-line max-len
    });
  }
};

exports.updateLoanStatus = async (token, data) => {
  const options = {
    url: `${services.payment.endpoint}${services.payment.updateLoanStatus}`,
    method: 'POST',
    headers: {
      Authorization: `JWT ${token}`,
    },
    data,
  };

  try {
    const response = await axios(options);
    return response.data;
  } catch (e) {
    throw new APIError({
      status: (e.response ? e.response.status : httpStatus.INTERNAL_SERVER_ERROR),
      message: ((e.response && e.response.data) ? (e.response.data.ErrorMsg || e.response.data.UserMsg) : e.message), // eslint-disable-line max-len
    });
  }
};

exports.updateCurrentSlab = async (token, data) => {
  const options = {
    url: `${services.payment.endpoint}${services.payment.updateCurrentSlab}`,
    method: 'PUT',
    headers: {
      Authorization: `JWT ${token}`,
    },
    data,
  };

  try {
    const response = await axios(options);
    return response.data;
  } catch (e) {
    throw new APIError({
      status: (e.response ? e.response.status : httpStatus.INTERNAL_SERVER_ERROR),
      message: ((e.response && e.response.data) ? (e.response.data.ErrorMsg || e.response.data.UserMsg) : e.message), // eslint-disable-line max-len
    });
  }
};

exports.resetCurrentSlab = async (token, data) => {
  const options = {
    url: `${services.payment.endpoint}${services.payment.resetCurrentSlab}`,
    method: 'PUT',
    headers: {
      Authorization: `JWT ${token}`,
    },
    data,
  };

  try {
    const response = await axios(options);
    return response.data;
  } catch (e) {
    throw new APIError({
      status: (e.response ? e.response.status : httpStatus.INTERNAL_SERVER_ERROR),
      message: ((e.response && e.response.data) ? (e.response.data.ErrorMsg || e.response.data.UserMsg) : e.message), // eslint-disable-line max-len
    });
  }
};

exports.restorePaymentData = async (token, payload) => {
  const options = {
    url: `${services.payment.endpoint}${services.payment.restorePaymentData}`,
    method: 'PATCH',
    data: payload,
    headers: {
      Authorization: `JWT ${token}`,
    },
  };

  const { data: response } = await axios(options);
  return response;
};

exports.fetchLoanPaymentData = async (payload) => {
  const options = {
    url: `${services.payment.bypassKongEndpoint}${services.payment.fetchLoanPaymentData}`,
    method: 'GET',
    params: payload,
    headers: {
      Authorization: getBasicAuthString(services.payment.auth.username, services.payment.auth.password), // eslint-disable-line max-len
    },
  };

  const { data: response } = await axios(options);
  return response;
};

exports.checkRazorpayPaymentStatus = async (token, payload) => {
  const options = {
    url: `${services.payment.endpoint}${services.payment.checkRazorpayPaymentStatus}`,
    method: 'GET',
    params: payload,
    headers: {
      Authorization: `JWT ${token}`, // eslint-disable-line max-len
    },
  };

  const { data: response } = await axios(options);
  return response;
};
