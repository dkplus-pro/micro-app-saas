import type { App as VueApp, Component } from 'vue';
import App from './App.vue';

type CreateSSRApp = (rootComponent: Component) => VueApp;

export function createTenantShellApp(createSSRApp: CreateSSRApp) {
  const app = createSSRApp(App);
  return { app };
}
