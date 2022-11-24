import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faUserCircle, faBars, faDownload, faClipboardList,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Font awesome register
library.add(faUserCircle, faBars, faDownload, faClipboardList);

Vue.component('font-awesome-icon', FontAwesomeIcon);
