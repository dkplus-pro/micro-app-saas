<script setup lang="ts">
import { computed } from 'vue';
import { getGeneratedModuleRegistry, getGeneratedPages, getGeneratedRuntimeConfig, getGeneratedTabBar } from './adapters/generated-config.ts';
import { tenantConfig } from './generated/tenant.config.ts';

const pages = computed(() => getGeneratedPages());
const tabs = computed(() => getGeneratedTabBar());
const modules = computed(() => Object.keys(getGeneratedModuleRegistry()));
const runtime = computed(() => getGeneratedRuntimeConfig());
</script>

<template>
  <main class="tenant-shell">
    <section class="tenant-hero">
      <p class="tenant-hero__eyebrow">Generated tenant preview</p>
      <h1>{{ tenantConfig.tenantName }}</h1>
      <p class="tenant-hero__meta">Tenant ID: {{ tenantConfig.tenantId }}</p>
      <p class="tenant-hero__meta">API: {{ runtime.runtime.apiBase }}</p>
    </section>

    <section class="tenant-section">
      <h2>Enabled pages</h2>
      <ul>
        <li v-for="page in pages" :key="page.key">
          <strong>{{ page.title }}</strong>
          <span>{{ page.route }}</span>
        </li>
      </ul>
    </section>

    <section class="tenant-section">
      <h2>Tab bar</h2>
      <ul>
        <li v-for="tab in tabs" :key="tab.key">
          <strong>{{ tab.text }}</strong>
          <span>{{ tab.pagePath }}</span>
        </li>
      </ul>
    </section>

    <section class="tenant-section">
      <h2>Tenant modules</h2>
      <p>{{ modules.join(', ') || 'No modules enabled' }}</p>
    </section>
  </main>
</template>

<style>
:root {
  color: #111827;
  background: #f7f8fa;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

body {
  margin: 0;
}

page {
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

.tenant-shell {
  box-sizing: border-box;
  min-height: 100vh;
  padding: 40px;
}

.tenant-hero,
.tenant-section {
  max-width: 840px;
  margin: 0 auto 24px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.08);
}

.tenant-hero__eyebrow,
.tenant-hero__meta {
  margin: 0 0 8px;
  color: #64748b;
}

h1,
h2 {
  margin: 0 0 16px;
}

ul {
  display: grid;
  gap: 12px;
  padding: 0;
  list-style: none;
}

li {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

li span {
  color: #64748b;
}
</style>
