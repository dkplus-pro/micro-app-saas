<template>
  <view class="page page-b">
    <view class="page-header">
      <text>{{ title }}</text>
    </view>
    <StreamModuleRenderer v-if="hasModules" />
    <EmptyState v-else />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import EmptyState from './components/EmptyState.vue';
import StreamModuleRenderer from './components/StreamModuleRenderer.vue';
import { usePageBController } from './hooks';

const pageBController = usePageBController();
const title = computed(() => pageBController.title);
const modules = computed(() => pageBController.modules);
const hasModules = computed(() => modules.value.length > 0);
</script>
