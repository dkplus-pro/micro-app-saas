<template>
  <view class="page page-a">
    <text class="page-title">{{ pageTitle }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getGeneratedPage } from '../../adapters/generated-config';

const pageTitle = computed(() => getGeneratedPage('page-a')?.title || 'Page A');
</script>

<style scoped>
.page-a {
  min-height: 100vh;
  padding: 32rpx;
  background: #f7f8fa;
}

.page-title {
  color: #1f2937;
  font-size: 36rpx;
  font-weight: 600;
}
</style>
