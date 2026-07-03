<template>
  <view class="page page-b">
    <view class="module-card" v-for="entry in modules" :key="entry.id">
      <component :is="entry.component" v-bind="entry.props" :data-source="entry.dataSource" />
    </view>
  </view>
</template>

<script>
import { moduleRegistry } from '../../generated/module-registry.js';
import { getRuntimeConfig } from '../../runtime/tenant-provider.js';

export default {
  name: 'FlowPageB',
  data() {
    return {
      tenantId: getRuntimeConfig().tenantId,
      modules: moduleRegistry
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
.module-card {
  margin-bottom: 24rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(23, 43, 77, 0.08);
}
</style>
