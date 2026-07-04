<template>
  <view class="page-header">
    <text class="page-header__title">{{ title }}</text>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<style scoped>
.page-header {
  margin-bottom: 24rpx;
}

.page-header__title {
  color: #111827;
  font-size: 36rpx;
  font-weight: 700;
}
</style>
