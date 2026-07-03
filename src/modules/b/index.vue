<template>
  <view class="module module-b">
    <text class="module-title">{{ title }}</text>
    <text class="module-source">{{ dataSource }}</text>
  </view>
</template>

<script>
export default {
  name: 'ModuleB',
  props: {
    title: {
      type: String,
      default: 'Module B'
    },
    dataSource: {
      type: String,
      default: ''
    }
  }
};
</script>

<style>
.module-title {
  display: block;
  color: #172b4d;
  font-weight: 700;
}
.module-source {
  display: block;
  margin-top: 8rpx;
  color: #7a869a;
  font-size: 24rpx;
}
</style>
