import { createApp } from 'vue'
import { createPinia } from 'pinia';
import './index.css'
import App from './App.vue'
import router from './router/index.js'
import PhosphorIcons from "@phosphor-icons/vue" 

// SWAL SWEET ALERTS GLOBAL CONFIG
import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const pinia = createPinia();
const app = createApp(App);

app.use(PhosphorIcons)
app.use(VueSweetalert2);
app.use(pinia);
app.use(router).mount('#app');