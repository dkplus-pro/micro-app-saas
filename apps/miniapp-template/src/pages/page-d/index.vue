<template>
  <view class="page page-d">
    <text class="page-title">{{ pageTitle }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getGeneratedPage } from '../../adapters/generated-config';

const pageTitle = computed(() => getGeneratedPage('page-d')?.title || 'Page D');
</script>

<style scoped>
.page-d {
  min-height: 100vh;
  padding: 32rpx;
  background: #eff6ff;
}

.page-title {
  color: #1d4ed8;
  font-size: 32rpx;
  font-weight: 600;
}
</style>
