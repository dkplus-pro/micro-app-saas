const fs = require('node:fs');
const path = require('node:path');

function resolveTemplateRoot() {
  const candidates = [
    typeof __dirname === 'string' ? __dirname : '',
    process.cwd(),
    path.join(process.cwd(), 'apps/miniapp-template')
  ];

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(path.join(candidate, 'manifest.config.js'))) {
      return candidate;
    }
  }

  return typeof __dirname === 'string' ? __dirname : process.cwd();
}

const { loadGeneratedConfig } = require(path.join(resolveTemplateRoot(), 'manifest.config.js'));

export default pages;
