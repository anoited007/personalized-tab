#!/usr/bin/env node
// Assembles the three built Angular apps + manifest + icons + background
// worker into dist-extension/ — the folder to "Load unpacked" in Chrome.
import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, 'dist-extension');
const apps = ['newtab', 'options', 'popup'];

console.log('› Building Angular apps (newtab, options, popup)...');
for (const app of apps) {
  execSync(`npx ng build ${app}`, { cwd: root, stdio: 'inherit' });
}

console.log('› Assembling dist-extension/...');
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

cpSync(join(root, 'manifest.json'), join(outDir, 'manifest.json'));
cpSync(join(root, 'background', 'background.js'), join(outDir, 'background.js'));
cpSync(join(root, 'icon16x16.png'), join(outDir, 'icon16x16.png'));
cpSync(join(root, 'icon32x32.png'), join(outDir, 'icon32x32.png'));

for (const app of apps) {
  const browserOutput = join(root, 'dist', app, 'browser');
  const flatOutput = join(root, 'dist', app);
  const source = existsSync(browserOutput) ? browserOutput : flatOutput;
  cpSync(source, join(outDir, app), { recursive: true });
}

// newtab's background photo is referenced with an extension-root-absolute
// URL (/bg.jpg) so it resolves the same way under `ng serve` (served at "/")
// and inside the packaged extension (newtab/index.html is one level deep).
cpSync(join(outDir, 'newtab', 'bg.jpg'), join(outDir, 'bg.jpg'));

console.log(`✔ Extension assembled at ${outDir}`);
console.log('  Load it via chrome://extensions → Developer mode → Load unpacked');
