<script setup lang="ts">
import { useTenantSnapshot } from './stores/tenant.store';

const snapshot = useTenantSnapshot();
</script>

<template>
  <main class="tenant-shell">
    <p class="eyebrow">Schema UniApp SaaS Factory</p>
    <h1>{{ snapshot.tenant.tenantName }}</h1>
    <p>Tenant ID: {{ snapshot.tenant.tenantId }}</p>
  </main>
</template>

<style>
page,
body {
  margin: 0;
  background: #f7f8fa;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.tenant-shell {
  max-width: 720px;
  margin: 48px auto;
  padding: 32px;
  border-radius: 24px;
  background: white;
  box-shadow: 0 16px 48px rgb(15 23 42 / 10%);
}

.eyebrow {
  color: #2563eb;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
</style>
