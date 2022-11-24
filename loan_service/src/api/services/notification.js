const axios = require('axios');
const { urls, notificationService } = require('../../config/vars');

exports.listCategories = async () => {
  const options = {
    url: `${urls.notification.endpoint}${urls.notification.listCategories}`,
    method: 'GET',
    auth: {
      username: notificationService.auth.client,
      password: notificationService.auth.token,
    },
  };

  const response = await axios(options);
  return response.data.categories;
};

exports.listProviders = async () => {
  const options = {
    url: `${urls.notification.endpoint}${urls.notification.listProviders}`,
    method: 'GET',
    auth: {
      username: notificationService.auth.client,
      password: notificationService.auth.token,
    },
  };

  const response = await axios(options);
  return response.data.providers;
};

exports.listTemplates = async () => {
  const options = {
    url: `${urls.notification.endpoint}${urls.notification.listTemplates}`,
    method: 'GET',
    auth: {
      username: notificationService.auth.client,
      password: notificationService.auth.token,
    },
  };

  const response = await axios(options);
  return response.data.templates;
};

exports.listTypes = async () => {
  const options = {
    url: `${urls.notification.endpoint}${urls.notification.listTypes}`,
    method: 'GET',
    auth: {
      username: notificationService.auth.client,
      password: notificationService.auth.token,
    },
  };

  const response = await axios(options);
  return response.data.types;
};

exports.sendSMS = async (data) => {
  const options = {
    url: `${urls.notification.endpoint}${urls.notification.sendSMS}`,
    method: 'POST',
    auth: {
      username: notificationService.auth.client,
      password: notificationService.auth.token,
    },
    data,
  };
  const response = await axios(options);
  return response.data;
};
