<template>
  <view class="page page-b">
    <FlowPageBModules />
  </view>
</template>

<script>
import FlowPageBModules from '../../generated/flow-page-b-modules.vue';
import { getRuntimeConfig } from '../../runtime/tenant-provider.js';

export default {
  name: 'FlowPageB',
  components: {
    FlowPageBModules
  },
  data() {
    return {
      tenantId: getRuntimeConfig().tenantId
    };
  }
};
</script>

<style>
.page-b {
  min-height: 100vh;
  padding: 24rpx;
  background: #f7f8fa;
}
</style>
