export function readArg(name: string, fallback?: string): string {
  const prefix = `--${name}=`;
  const direct = process.argv.find((arg) => arg.startsWith(prefix));
  if (direct) return direct.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required --${name}`);
}

export function readListArg(name: string, fallback: string[] = []): string[] {
  const value = readArg(name, fallback.join(','));
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}
