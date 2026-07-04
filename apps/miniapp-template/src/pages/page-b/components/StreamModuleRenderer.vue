<template>
  <view class="stream-layout">
    <view v-for="moduleRef in modules" :key="moduleRef.key" class="stream-layout__item">
      <text>{{ moduleRef.displayName }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { usePageBModulesController } from '../hooks/usePageBModulesController';

const { modules } = usePageBModulesController();
</script>
