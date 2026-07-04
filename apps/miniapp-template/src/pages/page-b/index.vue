<template>
  <view class="page page-b">
    <PageHeader :title="title" />
    <StreamModuleRenderer />
  </view>
</template>

<script setup lang="ts">
import PageHeader from './components/PageHeader.vue';
import StreamModuleRenderer from './components/StreamModuleRenderer.vue';
import { usePageBController } from './hooks';

const { title } = usePageBController();
</script>
