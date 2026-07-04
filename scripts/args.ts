export function readArg(name: string, fallback?: string): string {
  const prefix = `--${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length) ?? fallback;
  if (!value) {
    throw new Error(`Missing required --${name}=... argument`);
  }
  return value;
}

export function readCsvArg(name: string, fallback?: string): string[] {
  return readArg(name, fallback)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function repoRootFromCwd(): string {
  return process.cwd();
}
