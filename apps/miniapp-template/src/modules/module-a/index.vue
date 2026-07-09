<template>
  <BizModule v-bind="$attrs" />
</template>

<script lang="ts">
export default {
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import BizModule from '../../biz/modules/module-a/index.vue';
</script>
