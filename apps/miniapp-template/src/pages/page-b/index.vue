<template>
  <view class="page-b">
    <StreamModuleRenderer />
  </view>
</template>

<script setup lang="ts">
import StreamModuleRenderer from './components/StreamModuleRenderer.vue';
import { usePageBController } from './hooks/index.js';

usePageBController();
</script>
