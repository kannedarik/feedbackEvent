/* eslint-disable no-param-reassign */
import router from '../router/index';
import store from '../store';

const onSuccess = (response) => {
  store.dispatch('loader/clearLoading');
  return response;
};

const onError = (error) => {
  store.dispatch('loader/clearLoading');

  // To handle the unauthorized case
  if (error.response.status === 401 || error.response.status === 403) {
    const { url } = error.response.config;
    let resetLoginInfo = true;

    if (url.includes('pinverification') || url.includes('aaa')) {
      resetLoginInfo = false;
    }

    if (resetLoginInfo) {
      store.dispatch('auth/tempLogout');
      router.push('/login');
    }
  }
  return Promise.reject(error);
};

const beforeRequestSuccess = (config) => {
  if (config.url.includes('getpartpaymentsplit')) {
    store.dispatch('loader/clearLoading');
  } else if (config.url.includes('esign')) {
    store.dispatch('loader/setLoading', { esign: true, loader: true });
  } else {
    store.dispatch('loader/setLoading', { esign: false, loader: true });
  }
  if (store.getters['auth/isAuthenticated']) {
    if (config.url.includes('pinverification')) {
      config.headers.Authorization = `JWT ${store.getters['auth/pinToken']}`;
    } else {
      config.headers.Authorization = `JWT ${store.getters['auth/authToken']}`;
    }
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
};

const beforeRequestError = (error) => {
  store.dispatch('loader/clearLoading');
  return Promise.reject(error);
};

export {
  onSuccess, onError, beforeRequestSuccess, beforeRequestError,
};
