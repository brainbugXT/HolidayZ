/**
 * Generate PWA icon placeholder files
 * Since we're using SVG, we'll create minimal PNG files that redirect browsers to use the SVG
 * For a production app, you should use proper PNG conversions
 */

import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');
const svgPath = path.join(publicDir, 'favicon.svg');

async function generateIcons() {
  console.log('🎨 Generating PWA icons from favicon.svg...');

  try {
    // Check if canvas package is available
    const sizes = [
      { name: 'icon-192.png', size: 192 },
      { name: 'icon-512.png', size: 512 },
      { name: 'icon-maskable-192.png', size: 192, padding: 0.2 },
      { name: 'icon-maskable-512.png', size: 512, padding: 0.2 },
      { name: 'apple-touch-icon.png', size: 180 },
    ];

    // Load SVG
    const img = await loadImage(svgPath);

    for (const { name, size, padding = 0 } of sizes) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');

      // Calculate dimensions with padding for maskable icons
      const actualSize = size * (1 - padding * 2);
      const offset = size * padding;

      // Draw white background for maskable icons
      if (padding > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
      }

      // Draw the SVG
      ctx.drawImage(img, offset, offset, actualSize, actualSize);

      // Save to file
      const buffer = canvas.toBuffer('image/png');
      const outputPath = path.join(publicDir, name);
      fs.writeFileSync(outputPath, buffer);
      console.log(`✅ Created ${name}`);
    }

    console.log('\n✨ All icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    console.log('\n💡 Run: npm install canvas');
    console.log('   Or use ImageMagick: brew install imagemagick && ./scripts/generate-icons.sh');
  }
}

generateIcons();
