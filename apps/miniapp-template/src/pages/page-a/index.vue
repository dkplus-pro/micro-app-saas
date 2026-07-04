<template>
  <view class="page page-a">
    <view class="page-a__title">Page A</view>
    <view v-if="modules.length === 0" class="page-a__empty">暂无可展示模块</view>
    <view
      v-for="module in modules"
      :key="module.key"
      class="stream-module page-a__module"
      :class="{ 'page-a__module--clickable': Boolean(module.navigationUrl) }"
      @click="navigateModule(module)"
    >
      <text class="page-a__module-title">{{ module.displayName }}</text>
      <text v-if="module.navigationUrl" class="page-a__module-action">点击进入页面 D</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { usePageAController } from './hooks';

const { modules, navigateModule } = usePageAController();
</script>

<style scoped>
.page-a__title {
  margin-bottom: 24rpx;
  color: #111827;
  font-size: 36rpx;
  font-weight: 700;
}

.page-a__empty {
  padding: 48rpx 24rpx;
  border-radius: 16rpx;
  background: #f3f4f6;
  color: #6b7280;
  text-align: center;
}

.page-a__module--clickable {
  cursor: pointer;
}

.page-a__module-title,
.page-a__module-action {
  display: block;
}

.page-a__module-title {
  font-size: 30rpx;
  font-weight: 600;
}

.page-a__module-action {
  margin-top: 8rpx;
  color: #1677ff;
  font-size: 24rpx;
}
</style>
