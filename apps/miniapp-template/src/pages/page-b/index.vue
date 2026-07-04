<template>
  <view class="page page-b">
    <PageHeader :title="pageTitle" />
    <StreamModuleRenderer :modules="modules" />
  </view>
</template>

<script setup lang="ts">
import PageHeader from './components/PageHeader.vue';
import StreamModuleRenderer from './components/StreamModuleRenderer.vue';
import { usePageBController } from './hooks';

const { modules, pageTitle } = usePageBController();
</script>

<style scoped>
.page-b {
  min-height: 100vh;
  padding: 24rpx;
  background: #f7f8fa;
}
</style>
