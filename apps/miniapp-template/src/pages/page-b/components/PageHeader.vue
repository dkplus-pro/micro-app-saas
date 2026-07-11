<template>
  <view class="page-header">
    <text>{{ title }}</text>
  </view>
</template>

<script setup lang="ts">
defineProps<{ title: string }>();
</script>
