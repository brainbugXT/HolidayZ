/**
 * Generate PWA icons from the HolidayZ source icon
 * This will create all required PWA icon sizes from holidayz-icon-source.png
 */

import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');
const sourcePath = path.join(publicDir, 'holidayz-icon-source.png');

async function generateIcons() {
  console.log('🎨 Generating PWA icons from holidayz-icon-source.png...');

  // Check if source file exists
  if (!fs.existsSync(sourcePath)) {
    console.error('❌ Source file not found: holidayz-icon-source.png');
    console.log('💡 Please save your icon as: public/holidayz-icon-source.png');
    process.exit(1);
  }

  try {
    const sizes = [
      { name: 'favicon.svg', size: null, type: 'copy' }, // We'll create a PNG favicon instead
      { name: 'favicon-16x16.png', size: 16 },
      { name: 'favicon-32x32.png', size: 32 },
      { name: 'icon-192.png', size: 192 },
      { name: 'icon-512.png', size: 512 },
      { name: 'icon-maskable-192.png', size: 192, padding: 0.1 },
      { name: 'icon-maskable-512.png', size: 512, padding: 0.1 },
      { name: 'apple-touch-icon.png', size: 180 },
    ];

    // Load source image
    const img = await loadImage(sourcePath);
    console.log(`✅ Loaded source image: ${img.width}x${img.height}`);

    for (const { name, size, padding = 0, type } of sizes) {
      if (type === 'copy') {
        // Skip SVG, we'll handle it separately
        continue;
      }

      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');

      // Calculate dimensions with padding for maskable icons
      const actualSize = size * (1 - padding * 2);
      const offset = size * padding;

      // For maskable icons, use a white background
      // For regular icons, use transparent background
      if (padding > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
      }

      // Enable high-quality image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw the image
      ctx.drawImage(img, offset, offset, actualSize, actualSize);

      // Save to file
      const buffer = canvas.toBuffer('image/png');
      const outputPath = path.join(publicDir, name);
      fs.writeFileSync(outputPath, buffer);
      console.log(`✅ Created ${name} (${size}x${size})`);
    }

    // Also create a copy as favicon.png for fallback
    const faviconCanvas = createCanvas(32, 32);
    const faviconCtx = faviconCanvas.getContext('2d');
    faviconCtx.imageSmoothingEnabled = true;
    faviconCtx.imageSmoothingQuality = 'high';
    faviconCtx.drawImage(img, 0, 0, 32, 32);
    const faviconBuffer = faviconCanvas.toBuffer('image/png');
    fs.writeFileSync(path.join(publicDir, 'favicon.png'), faviconBuffer);
    console.log('✅ Created favicon.png (32x32)');

    console.log('\n✨ All icons generated successfully!');
    console.log('📦 Generated files:');
    console.log('  - favicon-16x16.png, favicon-32x32.png, favicon.png');
    console.log('  - icon-192.png, icon-512.png (PWA icons)');
    console.log('  - icon-maskable-192.png, icon-maskable-512.png (Maskable PWA icons)');
    console.log('  - apple-touch-icon.png (Apple devices)');
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    console.log('\n💡 Run: npm install canvas');
    console.log('   Or use ImageMagick: brew install imagemagick && ./scripts/generate-icons.sh');
    process.exit(1);
  }
}

generateIcons();
