import { createApp as createVueApp, createSSRApp } from 'vue';
import App from './App.vue';

export function createApp() {
  const app = createSSRApp(App);
  return { app };
}

if (typeof document !== 'undefined') {
  createVueApp(App).mount('#app');
}
