const httpStatus = require('http-status');
const axios = require('axios');
const APIError = require('../utils/APIError');
const { services } = require('../../config/vars');

exports.listDigiSignProviders = async () => {
  const options = {
    url: `${services.docsign.endpoint}${services.docsign.listProviders.digiSign}`,
    method: 'GET',
    auth: {
      username: services.docsign.credentials.client,
      password: services.docsign.credentials.token,
    },
  };

  const response = await axios(options);
  return response.data.providers;
};

exports.listESignProviders = async () => {
  const options = {
    url: `${services.docsign.endpoint}${services.docsign.listProviders.eSign}`,
    method: 'GET',
    auth: {
      username: services.docsign.credentials.client,
      password: services.docsign.credentials.token,
    },
  };

  const response = await axios(options);
  return response.data.providers;
};

exports.listTypes = async () => {
  const options = {
    url: `${services.docsign.endpoint}${services.docsign.listTypes}`,
    method: 'GET',
    auth: {
      username: services.docsign.credentials.client,
      password: services.docsign.credentials.token,
    },
  };

  const response = await axios(options);
  return response.data.types;
};

exports.createDigiSign = async (data) => {
  const options = {
    url: `${services.docsign.endpoint}${services.docsign.digiSignRequest}`,
    method: 'POST',
    auth: {
      username: services.docsign.credentials.client,
      password: services.docsign.credentials.token,
    },
    data,
  };

  const response = await axios(options);
  return response.data.request;
};

exports.verifyDigiSign = async (id, data) => {
  const options = {
    url: `${services.docsign.endpoint}${services.docsign.digiSignRequest}/${id}/verify`,
    method: 'PUT',
    auth: {
      username: services.docsign.credentials.client,
      password: services.docsign.credentials.token,
    },
    data,
  };

  try {
    const response = await axios(options);
    return response.data;
  } catch (e) {
    throw new APIError({
      status: (e.response ? e.response.status : httpStatus.INTERNAL_SERVER_ERROR),
      message: ((e.response && e.response.data) ? e.response.data.message : e.message),
    });
  }
};

exports.digiSignOTP = async (id, data) => {
  const options = {
    url: `${services.docsign.endpoint}${services.docsign.digiSignRequest}/${id}/otp`,
    method: 'PUT',
    auth: {
      username: services.docsign.credentials.client,
      password: services.docsign.credentials.token,
    },
    data,
  };

  const response = await axios(options);
  return response;
};

exports.createESign = async (data) => {
  const options = {
    url: `${services.docsign.endpoint}${services.docsign.eSignRequest}`,
    method: 'POST',
    auth: {
      username: services.docsign.credentials.client,
      password: services.docsign.credentials.token,
    },
    data,
  };

  const response = await axios(options);
  return response.data.request;
};

exports.listRequests = async (filter) => {
  const options = {
    url: `${services.docsign.endpoint}${services.docsign.signRequest}`,
    method: 'GET',
    auth: {
      username: services.docsign.credentials.client,
      password: services.docsign.credentials.token,
    },
    params: filter,
  };

  const response = await axios(options);
  return response.data.requests;
};
