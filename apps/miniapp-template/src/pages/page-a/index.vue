<template>
  <view class="page page-a">
    <view class="page-a__header">
      <text class="page-a__title">{{ title }}</text>
    </view>

    <view v-if="pageModules.length" class="page-a__modules">
      <component
        :is="module.component"
        v-for="module in pageModules"
        :key="module.key"
        v-bind="module.props"
      />
    </view>

    <view v-else class="page-a__empty">
      <text>暂无租户模块</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { moduleEntries } from '../../generated/module-entry.ts';
import { pagesConfig } from '../../generated/pages.config.ts';
import { routeConfig } from '../../generated/route.config.ts';

type GeneratedModuleRef = {
  key: string;
  props?: Record<string, unknown>;
};

type PageAModule = {
  key: string;
  component: unknown;
  props: Record<string, unknown>;
};

const generatedModules = moduleEntries as Record<string, unknown>;
const generatedRoutes = routeConfig as Record<string, string>;
const pageAConfig = computed(() => pagesConfig.find((page) => page.key === 'page-a'));
const title = computed(() => pageAConfig.value?.style.navigationBarTitleText ?? 'Page A');

const pageModules = computed<PageAModule[]>(() => {
  const modules = (pageAConfig.value?.modules ?? []) as GeneratedModuleRef[];
  return modules.flatMap((moduleRef) => {
    const component = generatedModules[moduleRef.key];
    if (!component) return [];
    return [{
      key: moduleRef.key,
      component,
      props: resolveModuleProps(moduleRef)
    }];
  });
});

function resolveModuleProps(moduleRef: GeneratedModuleRef): Record<string, unknown> {
  const props = { ...(moduleRef.props ?? {}) };
  const targetPage = typeof props.targetPage === 'string' ? props.targetPage : undefined;
  if (targetPage && generatedRoutes[targetPage]) {
    props.targetRoute = generatedRoutes[targetPage];
  }
  delete props.targetPage;
  return props;
}
</script>

<style scoped>
.page-a {
  min-height: 100vh;
  padding: 32rpx;
  background: #f8fafc;
}

.page-a__header {
  margin-bottom: 24rpx;
}

.page-a__title {
  color: #0f172a;
  font-size: 36rpx;
  font-weight: 700;
}

.page-a__modules {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.page-a__empty {
  padding: 32rpx;
  border: 1rpx dashed #cbd5e1;
  border-radius: 16rpx;
  color: #64748b;
  background: #ffffff;
  font-size: 26rpx;
}
</style>
