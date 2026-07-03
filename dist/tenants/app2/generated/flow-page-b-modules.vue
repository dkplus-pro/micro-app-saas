<template>
  <view>
    <view class="module-card" v-for="entry in modules" :key="entry.moduleId">
      <ModuleA v-if="entry.moduleId === 'a'" v-bind="entry.props" :data-source="entry.dataSource" />
      <ModuleD v-if="entry.moduleId === 'd'" v-bind="entry.props" :data-source="entry.dataSource" />
      <ModuleC v-if="entry.moduleId === 'c'" v-bind="entry.props" :data-source="entry.dataSource" />
    </view>
  </view>
</template>

<script>
import runtimeConfig from './tenant.js';
import ModuleA from '../modules/a/index.vue';
import ModuleD from '../modules/d/index.vue';
import ModuleC from '../modules/c/index.vue';

export default {
  name: 'FlowPageBModules',
  components: { ModuleA, ModuleD, ModuleC },
  computed: {
    modules() {
      return runtimeConfig.layouts.B.modules;
    }
  }
};
</script>
