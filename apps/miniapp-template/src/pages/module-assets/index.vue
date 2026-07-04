<template>
  <view class="module-assets">
    <text v-for="moduleKey in moduleKeys" :key="moduleKey">{{ moduleKey }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { subPackageModuleEntries } from './module-entry.ts';

const moduleKeys = computed(() => Object.keys(subPackageModuleEntries));
</script>
