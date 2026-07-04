<script setup lang="ts">
import { useTenantSnapshot } from './stores/tenant.store.ts';

const snapshot = useTenantSnapshot();
</script>

<template>
  <main class="tenant-shell">
    <p class="eyebrow">Generated tenant preview</p>
    <h1>{{ snapshot.tenant.tenantName }}</h1>
    <p class="tenant-id">{{ snapshot.tenant.tenantId }}</p>
  </main>
</template>

<style>
page,
body {
  margin: 0;
  background: #f7f8fa;
  color: #1f2937;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.tenant-shell {
  max-width: 720px;
  margin: 64px auto;
  padding: 32px;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
}

.eyebrow {
  margin: 0 0 12px;
  color: #2563eb;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: 2rem;
}

.tenant-id {
  margin: 12px 0 0;
  color: #64748b;
}
</style>
