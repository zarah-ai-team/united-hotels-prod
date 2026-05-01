/**
 * fix-figma-assets.mjs
 * =====================
 * Run this script ONCE in your Figma Make exported project folder.
 * It fixes the "figma:asset/" import errors so the project runs locally.
 *
 * HOW TO USE:
 * 1. Copy this file into your "United Hotel Os - Code" folder
 * 2. Open terminal in that folder
 * 3. Run: node fix-figma-assets.mjs
 * 4. Then run: npm run dev
 */

import fs from 'fs';
import path from 'path';

console.log('');
console.log('===========================================');
console.log('  United Hotels - Figma Asset Fix Script');
console.log('===========================================');
console.log('');

const cwd = process.cwd();

// Step 1: Create public/figma-assets directory
const publicDir = path.join(cwd, 'public');
const assetDir = path.join(publicDir, 'figma-assets');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
if (!fs.existsSync(assetDir)) {
  fs.mkdirSync(assetDir, { recursive: true });
}
console.log('Done: Created public/figma-assets/ directory');

// Step 2: Minimal valid PNG placeholder
const PLACEHOLDER_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNjN9GQAAAABJRU5ErkJggg==',
  'base64'
);

// Step 3: Scan all source files for figma:asset imports
const srcDir = path.join(cwd, 'src');
const allAssetHashes = new Set();

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      scanDirectory(fullPath);
    } else if (/\.(tsx?|jsx?|mjs)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const regex = /figma:asset\/([a-f0-9]+\.png)/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        allAssetHashes.add(match[1]);
      }
    }
  }
}

scanDirectory(srcDir);
console.log('Done: Found ' + allAssetHashes.size + ' figma:asset references');

// Step 4: Create placeholder images
for (const hash of allAssetHashes) {
  const filePath = path.join(assetDir, hash);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, PLACEHOLDER_PNG);
  }
}
console.log('Done: Created ' + allAssetHashes.size + ' placeholder images');

// Step 5: Fix imports in all source files
function fixImports(dir) {
  if (!fs.existsSync(dir)) return 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let fixedCount = 0;

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      fixedCount += fixImports(fullPath);
    } else if (/\.(tsx?|jsx?|mjs)$/.test(entry.name)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;

      // Replace: import xyz from "figma:asset/HASH.png"
      // With:    const xyz = "/figma-assets/HASH.png"
      content = content.replace(
        /import\s+(\w+)\s+from\s+["']figma:asset\/([a-f0-9]+\.png)["'];?/g,
        'const $1 = "/figma-assets/$2";'
      );

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        fixedCount++;
        const rel = path.relative(cwd, fullPath);
        console.log('   Fixed: ' + rel);
      }
    }
  }
  return fixedCount;
}

const totalFixed = fixImports(srcDir);
console.log('Done: Fixed imports in ' + totalFixed + ' files');

console.log('');
console.log('===========================================');
console.log('  ALL DONE! Now run:  npm run dev');
console.log('===========================================');
console.log('');
console.log('Open http://localhost:5173 in your browser');
console.log('');
