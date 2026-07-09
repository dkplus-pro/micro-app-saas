import { onLaunch, onShow } from '@dcloudio/uni-app';
import { useTenantSnapshot } from '../base/store/tenant.store.ts';

export function useTenantLifecycle() {
  const snapshot = useTenantSnapshot();

  onLaunch(() => {
    console.log(`[tenant] launch ${snapshot.tenant.tenantId}`);
  });

  onShow(() => {
    console.log(`[tenant] show ${snapshot.tenant.tenantId}`);
  });

  return snapshot;
}
