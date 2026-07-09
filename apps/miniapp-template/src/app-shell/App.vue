<script setup lang="ts">
import { onLaunch, onShow } from '@dcloudio/uni-app';
import { useTenantLifecycle } from './bootstrap.ts';

const snapshot = useTenantLifecycle();

onLaunch(() => {
  console.log(`[tenant] launch ${snapshot.tenant.tenantId}`);
});

onShow(() => {
  console.log(`[tenant] show ${snapshot.tenant.tenantId}`);
});
</script>

<style>
page {
  min-height: 100%;
  background: #f7f8fa;
  color: #111827;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.page {
  box-sizing: border-box;
  min-height: 100vh;
  padding: 32rpx;
}

.stream-module {
  margin-bottom: 24rpx;
  padding: 28rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 16rpx;
  background: #ffffff;
  color: #111827;
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.06);
}
</style>
