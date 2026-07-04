import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export interface WeixinAppJsonCompatResult {
  appJsonPath: string;
  changed: boolean;
}

/**
 * Some WeChat DevTools builds assume app.json has a subPackages array even
 * when a tenant has no non-tab subpackage pages. uni-app omits an empty
 * subPackages field, so normalize the built mp-weixin app.json after build.
 */
export async function ensureWeixinDevtoolsAppJsonCompat(
  outputDir = 'apps/miniapp-template/dist/build/mp-weixin'
): Promise<WeixinAppJsonCompatResult> {
  const appJsonPath = path.resolve(outputDir, 'app.json');
  const appJson = JSON.parse(await readFile(appJsonPath, 'utf8')) as Record<string, unknown>;

  if (!Array.isArray(appJson.pages)) {
    throw new Error(`${path.relative(process.cwd(), appJsonPath)} must contain a pages array`);
  }

  if (Array.isArray(appJson.subPackages)) {
    return { appJsonPath, changed: false };
  }

  appJson.subPackages = [];
  await writeFile(appJsonPath, `${JSON.stringify(appJson, null, 2)}\n`);
  return { appJsonPath, changed: true };
}

export function startWeixinDevtoolsAppJsonCompatPatcher(
  outputDir: string,
  onPatched: (result: WeixinAppJsonCompatResult) => void,
  intervalMs = 1000
): () => void {
  let running = false;
  let stopped = false;

  async function tick(): Promise<void> {
    if (running || stopped) return;
    running = true;
    try {
      const result = await ensureWeixinDevtoolsAppJsonCompat(outputDir);
      if (result.changed) onPatched(result);
    } catch (error) {
      if (!isMissingFileError(error)) throw error;
    } finally {
      running = false;
    }
  }

  const timer = setInterval(() => {
    void tick().catch((error: unknown) => {
      console.warn(`[uniapp-tenant] failed to patch WeChat app.json compatibility: ${error instanceof Error ? error.message : String(error)}`);
    });
  }, intervalMs);
  void tick();

  return () => {
    stopped = true;
    clearInterval(timer);
  };
}

function isMissingFileError(error: unknown): boolean {
  return typeof error === 'object'
    && error !== null
    && 'code' in error
    && (error as NodeJS.ErrnoException).code === 'ENOENT';
}
