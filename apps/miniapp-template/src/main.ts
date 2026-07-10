import { createSSRApp } from 'vue';
import { createTenantShellApp } from './app-shell/main.ts';

export function createApp() {
  return createTenantShellApp(createSSRApp);
}
