<template>
  <view class="page page-b">
    <view v-for="module in modules" :key="module.key" class="stream-module">
      {{ module.key }}
    </view>
  </view>
</template>

<script setup lang="ts">
import { usePageBController } from './hooks';

const { modules } = usePageBController();
</script>
