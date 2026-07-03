<template>
  <view class="page page-a">
    <text class="title">{{ title }}</text>
    <text class="subtitle">Tenant: {{ tenantId }}</text>
  </view>
</template>

<script>
import { getRuntimeConfig } from '../../runtime/tenant-provider.js';

const runtimeConfig = getRuntimeConfig();

export default {
  name: 'PageA',
  data() {
    const route = runtimeConfig.pages.find((page) => page.pageId === 'A');
    return {
      tenantId: runtimeConfig.tenantId,
      title: route?.title ?? runtimeConfig.displayName
    };
  }
};
</script>

<style>
.page-a {
  padding: 32rpx;
}
.title {
  display: block;
  color: #172b4d;
  font-size: 40rpx;
  font-weight: 700;
}
.subtitle {
  display: block;
  margin-top: 16rpx;
  color: #7a869a;
}
</style>
