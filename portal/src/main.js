import Vue from 'vue';
import MediaQueries from 'vue-media-queries';
import VueNoty from 'vuejs-noty';
import VueCookies from 'vue-cookies';
import BootstrapVue from 'bootstrap-vue';
import axios from 'axios';
import LoadScript from 'vue-plugin-load-script';
import clevertap from 'clevertap-web-sdk';
import * as VueGoogleMaps from 'vue2-google-maps';
import Geocoder from '@pderas/vue2-geocoder';
import i18n from '@/plugins/i18n';
import './index.css';
import App from './App.vue';
import router from './router';
import store from './store';
import getEnv from './utils/env';
import './fa-config';

import {
  onSuccess, onError, beforeRequestSuccess, beforeRequestError,
} from './interceptors';

// axios config
axios.interceptors.request.use(beforeRequestSuccess, beforeRequestError);
axios.interceptors.response.use(onSuccess, onError);

clevertap.init(getEnv('VUE_APP_CLEVERTAP_ID'));
clevertap.privacy.push({ optOut: false });
clevertap.privacy.push({ useIP: false });
clevertap.spa = true;

const mediaQueries = new MediaQueries();
Vue.config.productionTip = false;
if (getEnv('NODE_ENV') === 'production') {
  Vue.config.devtools = false;
} else {
  Vue.config.devtools = true;
}
Vue.use(mediaQueries);
Vue.use(BootstrapVue);
Vue.use(VueCookies);
Vue.$cookies.config('180d');
Vue.use(LoadScript);

Vue.use(VueGoogleMaps, {
  load: {
    key: getEnv('VUE_APP_GMAPS_TOKEN'),
    libraries: 'places', // necessary for places input
  },
});
Vue.use(Geocoder, {
  defaultCountryCode: null,
  defaultLanguage: null,
  defaultMode: 'lat-lng',
  googleMapsApiKey: getEnv('VUE_APP_GMAPS_TOKEN'),
});

Vue.use(VueNoty, {
  theme: 'semanticui',
  progressBar: true,
  timeout: 3000,
  layout: 'bottomRight',
});
new Vue({
  i18n,
  router,
  store,
  mediaQueries,
  render: (h) => h(App),
}).$mount('#app');
