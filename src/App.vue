<script>
import { getRuntimeConfig } from './runtime/tenant-provider.js';

export default {
  onLaunch() {
    const runtimeConfig = getRuntimeConfig();
    console.log(`[micro-app-saas] launch ${runtimeConfig.tenantId}@${runtimeConfig.configHash}`);
  }
};
</script>

<style>
page {
  min-height: 100%;
  background: #f7f8fa;
  color: #172b4d;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, sans-serif;
}

.page {
  box-sizing: border-box;
}
</style>
