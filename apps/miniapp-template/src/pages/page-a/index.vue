<template>
  <view class="page page-a">
    <view class="page-a__header">
      <text class="page-a__title">{{ title }}</text>
    </view>

    <view v-if="pageAImage" class="page-a__asset-demo">
      <text class="page-a__asset-title">{{ pageAImage.title ?? '租户图片 Demo' }}</text>
      <image class="page-a__asset-image" :src="pageAImage.src" mode="aspectFill" />
      <text v-if="pageAImage.description" class="page-a__asset-description">{{ pageAImage.description }}</text>
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
import { pageAAssets } from '../../generated/page-a-assets.ts';
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

type PageAImageAsset = {
  src: string;
  title?: string;
  description?: string;
};

const generatedRoutes = routeConfig as Record<string, string>;
const pageAConfig = computed(() => pagesConfig.find((page) => page.key === 'page-a'));
const title = computed(() => pageAConfig.value?.style.navigationBarTitleText ?? 'Page A');
const pageAImage = computed<PageAImageAsset | undefined>(() => {
  const image = pageAAssets.image as Partial<PageAImageAsset> | undefined;
  return typeof image?.src === 'string' && image.src.length > 0
    ? { src: image.src, title: image.title, description: image.description }
    : undefined;
});

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

.page-a__asset-demo {
  margin-bottom: 24rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.06);
}

.page-a__asset-title {
  display: block;
  margin-bottom: 16rpx;
  color: #111827;
  font-size: 28rpx;
  font-weight: 600;
}

.page-a__asset-image {
  display: block;
  width: 100%;
  height: 240rpx;
  overflow: hidden;
  border-radius: 16rpx;
  background: #e5e7eb;
}

.page-a__asset-description {
  display: block;
  margin-top: 12rpx;
  color: #64748b;
  font-size: 24rpx;
}
</style>
