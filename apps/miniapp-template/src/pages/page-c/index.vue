<template>
  <view class="page page-c">
    <text class="page-title">{{ pageTitle }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getGeneratedPage } from '../../adapters/generated-config';

const pageTitle = computed(() => getGeneratedPage('page-c')?.title || 'Page C');
</script>

<style scoped>
.page-c {
  min-height: 100vh;
  padding: 32rpx;
  background: #fff7ed;
}

.page-title {
  color: #9a3412;
  font-size: 32rpx;
  font-weight: 600;
}
</style>
