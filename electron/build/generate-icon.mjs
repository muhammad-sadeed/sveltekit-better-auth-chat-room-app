/**
 * Generates electron/build/icon.png (1024x1024, transparent background) from
 * src/lib/assets/favicon.svg, centered on a square canvas.
 *
 * Usage: bun run electron/build/generate-icon.mjs
 */
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const svgPath = join(root, 'src', 'lib', 'assets', 'favicon.svg');
const outPath = join(root, 'electron', 'build', 'icon.png');

const SIZE = 1024;
const svg = readFileSync(svgPath, 'utf8');

// Extract the inner content of the favicon svg (everything between the <svg> tags).
const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

// Original favicon viewBox is 107x128; center it on a square canvas at ~72% of the width.
const vb = { w: 107, h: 128 };
const scale = (SIZE * 0.72) / vb.h;
const tx = SIZE / 2 - (vb.w / 2) * scale;
const ty = SIZE / 2 - (vb.h / 2) * scale;

const padded = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <g transform="translate(${tx},${ty}) scale(${scale})">${inner}</g>
</svg>`;

const resvg = new Resvg(padded, { fitTo: { mode: 'width', value: SIZE } });
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, resvg.render().asPng());
console.log(`icon written to ${outPath}`);
