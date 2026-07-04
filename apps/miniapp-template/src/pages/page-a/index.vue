<template>
  <view class="page page-a">
    <view class="page-a__header">
      <text class="page-a__title">{{ title }}</text>
    </view>

    <view v-if="pageModules.length" class="page-a__modules">
      <HomeModuleRenderer :modules="pageModules" />
    </view>

    <view v-else class="page-a__empty">
      <text>暂无租户模块</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { pagesConfig } from '../../generated/pages.config.ts';
import { routeConfig } from '../../generated/route.config.ts';
import HomeModuleRenderer from '../../generated/home-module-renderer.vue';

type GeneratedModuleRef = {
  key: string;
  props?: Record<string, unknown>;
};

type PageAModule = {
  key: string;
  props: Record<string, unknown>;
};

const generatedRoutes = routeConfig as Record<string, string>;
const pageAConfig = computed(() => pagesConfig.find((page) => page.key === 'page-a'));
const title = computed(() => pageAConfig.value?.style.navigationBarTitleText ?? 'Page A');

const pageModules = computed<PageAModule[]>(() => {
  const modules = (pageAConfig.value?.modules ?? []) as GeneratedModuleRef[];
  return modules.map((moduleRef) => ({
    key: moduleRef.key,
    props: resolveModuleProps(moduleRef)
  }));
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
.page-a__title {
  margin-bottom: 24rpx;
  color: #111827;
  font-size: 36rpx;
  font-weight: 700;
}

.page-a__empty {
  padding: 48rpx 24rpx;
  border-radius: 16rpx;
  background: #f3f4f6;
  color: #6b7280;
  text-align: center;
}
</style>
