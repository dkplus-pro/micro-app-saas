declare module '*.vue' {
  const component: unknown;
  export default component;
}

declare module 'vue' {
  export function computed<T>(getter: () => T): { readonly value: T };
  export function createApp(rootComponent: unknown): { mount(selector: string): void; use(plugin: unknown): unknown };
  export function createSSRApp(rootComponent: unknown): { mount(selector: string): void; use(plugin: unknown): unknown };
}
