import Vue from 'vue';
import VueNoty from 'vuejs-noty';
import BootstrapVue from 'bootstrap-vue';
import axios from 'axios';
import App from './App.vue';
import lang from 'vuejs-localization';
import router from './router';
import store from './store';

import {
  onSuccess, onError, beforeRequestSuccess, beforeRequestError,
} from './interceptors';
import './fa-config';

// axios config
axios.interceptors.request.use(beforeRequestSuccess, beforeRequestError);
axios.interceptors.response.use(onSuccess, onError);

// import 3rd party plugins and components
lang.requireAll(require.context('./locale', true, /\.js$/));
Vue.use(BootstrapVue);
Vue.use(lang);

Vue.use(VueNoty, {
  theme: 'semanticui',
  progressBar: true,
  timeout: 3000,
  layout: 'bottomRight',
});
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
