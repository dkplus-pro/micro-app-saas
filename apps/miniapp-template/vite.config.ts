import { fileURLToPath, URL } from 'node:url';
import * as uniPluginModule from '@dcloudio/vite-plugin-uni';
import { defineConfig, type PluginOption } from 'vite';

type UniPluginFactory = () => PluginOption[];

function resolveUniPluginFactory(): UniPluginFactory {
  const moduleValue = uniPluginModule as unknown as {
    default?: unknown;
    'module.exports'?: unknown;
  };
  const defaultValue = moduleValue.default as { default?: unknown } | UniPluginFactory | undefined;
  const candidates = [
    moduleValue,
    moduleValue.default,
    defaultValue && typeof defaultValue === 'object' ? defaultValue.default : undefined,
    moduleValue['module.exports']
  ];
  const factory = candidates.find((candidate): candidate is UniPluginFactory => typeof candidate === 'function');
  if (!factory) throw new Error('Unable to resolve @dcloudio/vite-plugin-uni factory');
  return factory;
}

const uni = resolveUniPluginFactory();

export default defineConfig({
  plugins: uni(),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
