import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faUserCircle, faBars, faPlusCircle, faPlay, faDownload, faFileUpload, faBackward, faWindowClose, faReceipt, faCoins,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Font awesome register
library.add(faUserCircle, faBars, faPlusCircle, faPlay, faDownload, faFileUpload, faBackward, faWindowClose, faReceipt, faCoins);

Vue.component('font-awesome-icon', FontAwesomeIcon);
