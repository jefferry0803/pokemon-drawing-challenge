import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faEraser,
  faRotateLeft,
  faRotateRight,
} from '@fortawesome/free-solid-svg-icons';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(createPinia());
app.use(router);
library.add(faEraser, faRotateLeft, faRotateRight, faFile);
app.component('FontAwesomeIcon', FontAwesomeIcon);

app.mount('#app');

import 'bootstrap/dist/js/bootstrap';
