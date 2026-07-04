<template>
  <view class="stream-modules">
    <template v-if="modules.length">
      <view
        v-for="module in modules"
        :key="module.key"
        class="stream-modules__item"
      >
        <component
          :is="module.component"
          v-bind="module.props || {}"
        />
      </view>
    </template>
    <EmptyState v-else />
  </view>
</template>

<script setup lang="ts">
import EmptyState from './EmptyState.vue';
import type { PageBModuleViewModel } from '../types';

defineProps<{
  modules: PageBModuleViewModel[];
}>();
</script>

<style scoped>
.stream-modules {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.stream-modules__item {
  overflow: hidden;
  border-radius: 16rpx;
}
</style>
