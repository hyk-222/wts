// src/main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router'; 
import App from './App.vue';
import './styles.css';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

const app = createApp(App);

// 注册 Pinia
app.use(createPinia());

// 注册 Vue Router
app.use(router);

// 注册 Element Plus
app.use(ElementPlus);

app.mount('#app');