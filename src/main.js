// src/main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router'; 
import App from './App.vue';
import './styles.css';

const app = createApp(App);

// 注册 Pinia
app.use(createPinia());

// 注册 Vue Router
app.use(router);

app.mount('#app');