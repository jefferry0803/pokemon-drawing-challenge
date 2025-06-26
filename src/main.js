import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import VueVirtualScroller from 'vue-virtual-scroller';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(VueVirtualScroller);

app.mount('#app');

import 'bootstrap/dist/js/bootstrap';
