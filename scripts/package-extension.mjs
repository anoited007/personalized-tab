#!/usr/bin/env node
// Zips dist-extension/ (built by build-extension.mjs) into releases/, named
// after manifest.json's version, ready to upload to the Chrome Web Store.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const distExtension = join(root, 'dist-extension');
const releasesDir = join(root, 'releases');

if (!existsSync(distExtension)) {
  console.error('dist-extension/ not found — run `npm run build` first.');
  process.exit(1);
}

const { version } = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));
mkdirSync(releasesDir, { recursive: true });

const zipPath = join(releasesDir, `personalized-tab-v${version}.zip`);
rmSync(zipPath, { force: true });

execFileSync('zip', ['-r', '-X', zipPath, '.', '-x', '.*', '-x', '**/.DS_Store'], {
  cwd: distExtension,
  stdio: 'inherit',
});

console.log(`✔ Packaged ${zipPath}`);
