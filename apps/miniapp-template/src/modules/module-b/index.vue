<template>
  <view class="module-card module-card--b">
    <text class="module-card__title">{{ title || 'Module B' }}</text>
    <text v-if="description" class="module-card__description">{{ description }}</text>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
}>();
</script>

<style scoped>
.module-card {
  padding: 28rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 16rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.06);
}

.module-card__title {
  display: block;
  color: #111827;
  font-size: 30rpx;
  font-weight: 600;
}

.module-card__description {
  display: block;
  margin-top: 8rpx;
  color: #6b7280;
  font-size: 24rpx;
}
</style>
