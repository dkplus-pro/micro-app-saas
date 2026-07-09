import { createApp as createVueApp } from 'vue';
import App from './App.vue';

export function createWebApp(selector = '#app') {
  const app = createVueApp(App);
  app.mount(selector);
  return app;
}
