<template>
  <view class="page page-a">
    <text>{{ title }}</text>
  </view>
</template>

<script setup lang="ts">
import { pagesConfig } from '../../generated/pages.config';

const title = pagesConfig.find((page) => page.path === 'pages/page-a/index')?.style.navigationBarTitleText ?? 'Page A';
</script>
