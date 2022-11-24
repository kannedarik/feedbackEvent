/* eslint-disable no-param-reassign */
import router from '../router/index';
import store from '../store';

const onSuccess = (response) => {
  store.dispatch('loader/setLoading', false);
  return response;
};

const onError = (error) => {
  store.dispatch('loader/setLoading', false);

  // To handle the unauthorized case
  if (error.response.status === 401 || error.response.status === 403) {
    store.dispatch('auth/logout');
    router.push('/login');
  }
  return Promise.reject(error);
};

const beforeRequestSuccess = (config) => {
  store.dispatch('loader/setLoading', true);
  if (store.getters['auth/isAuthenticated']) {
    config.headers.Authorization = `JWT ${store.getters['auth/authToken']}`;
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
};

const beforeRequestError = (error) => {
  store.dispatch('loader/setLoading', false);
  return Promise.reject(error);
};

export {
  onSuccess, onError, beforeRequestSuccess, beforeRequestError,
};
