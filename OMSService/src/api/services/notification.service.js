const axios = require('axios');
const { services } = require('../../config/vars');

exports.listCategories = async () => {
  const options = {
    url: `${services.notification.endpoint}${services.notification.listCategories}`,
    method: 'GET',
    auth: {
      username: services.notification.credentials.client,
      password: services.notification.credentials.token,
    },
  };

  const response = await axios(options);
  return response.data.categories;
};

exports.listProviders = async () => {
  const options = {
    url: `${services.notification.endpoint}${services.notification.listProviders}`,
    method: 'GET',
    auth: {
      username: services.notification.credentials.client,
      password: services.notification.credentials.token,
    },
  };

  const response = await axios(options);
  return response.data.providers;
};

exports.listTemplates = async () => {
  const options = {
    url: `${services.notification.endpoint}${services.notification.listTemplates}`,
    method: 'GET',
    auth: {
      username: services.notification.credentials.client,
      password: services.notification.credentials.token,
    },
  };

  const response = await axios(options);
  return response.data.templates;
};

exports.listTypes = async () => {
  const options = {
    url: `${services.notification.endpoint}${services.notification.listTypes}`,
    method: 'GET',
    auth: {
      username: services.notification.credentials.client,
      password: services.notification.credentials.token,
    },
  };

  const response = await axios(options);
  return response.data.types;
};

exports.sendEmail = async (data) => {
  const options = {
    url: `${services.notification.endpoint}${services.notification.sendEmail}`,
    method: 'POST',
    auth: {
      username: services.notification.credentials.client,
      password: services.notification.credentials.token,
    },
    data,
  };

  const response = await axios(options);
  return response;
};

exports.sendPush = async (data) => {
  const options = {
    url: `${services.notification.endpoint}${services.notification.sendPush}`,
    method: 'POST',
    auth: {
      username: services.notification.credentials.client,
      password: services.notification.credentials.token,
    },
    data,
  };

  const response = await axios(options);
  return response;
};

exports.sendSMS = async (data) => {
  const options = {
    url: `${services.notification.endpoint}${services.notification.sendSMS}`,
    method: 'POST',
    auth: {
      username: services.notification.credentials.client,
      password: services.notification.credentials.token,
    },
    data,
  };

  const response = await axios(options);
  return response;
};

exports.sendTicket = async (data) => {
  const options = {
    url: `${services.notification.endpoint}${services.notification.sendTicket}`,
    method: 'POST',
    auth: {
      username: services.notification.credentials.client,
      password: services.notification.credentials.token,
    },
    data,
  };

  const response = await axios(options);
  return response;
};

exports.notificationDetails = async (notificationId) => {
  const options = {
    url: `${services.notification.endpoint}${services.notification.notificationDetails}/${notificationId}`,
    method: 'GET',
    auth: {
      username: services.notification.credentials.client,
      password: services.notification.credentials.token,
    },
  };

  const response = await axios(options);
  return response.data;
};
