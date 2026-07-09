export type MiniappCapabilityKey =
  | 'module-a-enabled'
  | 'module-b-enabled'
  | 'module-c-enabled'
  | 'module-d-enabled'
  | 'module-e-enabled';

export interface CapabilityRegistryEntry {
  key: MiniappCapabilityKey;
  runtimeFeatureKey: 'moduleA' | 'moduleB' | 'moduleC' | 'moduleD' | 'moduleE';
  layer: 'app-shell';
}

export const capabilityRegistry = {
  'module-a-enabled': { key: 'module-a-enabled', runtimeFeatureKey: 'moduleA', layer: 'app-shell' },
  'module-b-enabled': { key: 'module-b-enabled', runtimeFeatureKey: 'moduleB', layer: 'app-shell' },
  'module-c-enabled': { key: 'module-c-enabled', runtimeFeatureKey: 'moduleC', layer: 'app-shell' },
  'module-d-enabled': { key: 'module-d-enabled', runtimeFeatureKey: 'moduleD', layer: 'app-shell' },
  'module-e-enabled': { key: 'module-e-enabled', runtimeFeatureKey: 'moduleE', layer: 'app-shell' }
} as const satisfies Record<MiniappCapabilityKey, CapabilityRegistryEntry>;
