import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';
import axios from 'axios';
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import VueGoodTablePlugin from 'vue-good-table';
import lang from 'vuejs-localization';
import VueNoty from 'vuejs-noty';
import Multiselect from 'vue-multiselect';
import VueSweetalert2 from 'vue-sweetalert2';
import App from './App';
import router from './router';
import store from './store';

import {
  onSuccess, onError, beforeRequestSuccess, beforeRequestError,
} from './interceptors';
import './fa-config';
import getEnv from './utility/env';

// axios config
axios.interceptors.request.use(beforeRequestSuccess, beforeRequestError);
axios.interceptors.response.use(onSuccess, onError);

// Sentry config
if (getEnv('VUE_APP_SENTRY_ENABLE') === 'true') {
  Sentry.init({
    dsn: getEnv('VUE_APP_SENTRY_DSN'),
    environment: getEnv('NODE_ENV'),
    release: getEnv('VUE_APP_SENTRY_RELEASE'),
    integrations: [
      new Integrations.Vue({
        Vue,
        attachProps: true,
      }),
    ],
  });

  if (store.getters['auth/loggedInUser']) {
    Sentry.configureScope((scope) => {
      scope.setUser({ id: store.getters['auth/loggedInUser'].id });
    });
  }
}

// import 3rd party plugins and components
lang.requireAll(require.context('./locale', true, /\.js$/));
Vue.use(BootstrapVue);
Vue.use(VueNoty);
Vue.use(lang);
Vue.component('multiselect', Multiselect);
Vue.use(VueSweetalert2);
Vue.use(VueGoodTablePlugin);

Vue.config.productionTip = getEnv('NODE_ENV') === 'production';

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
