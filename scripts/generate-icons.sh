#!/bin/bash

# Script to generate PWA icons from favicon.svg
# This requires ImageMagick to be installed: brew install imagemagick

echo "🎨 Generating PWA icons from favicon.svg..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick is not installed!"
    echo "📦 Install it with: brew install imagemagick"
    exit 1
fi

cd "$(dirname "$0")/../public"

# Generate standard icons
echo "📱 Creating 192x192 icon..."
convert -background none favicon.svg -resize 192x192 icon-192.png

echo "📱 Creating 512x512 icon..."
convert -background none favicon.svg -resize 512x512 icon-512.png

echo "🍎 Creating Apple Touch Icon (180x180)..."
convert -background none favicon.svg -resize 180x180 apple-touch-icon.png

# Generate maskable icons (with padding for safe zone)
echo "🎭 Creating 192x192 maskable icon..."
convert -background none favicon.svg -resize 154x154 -gravity center -extent 192x192 icon-maskable-192.png

echo "🎭 Creating 512x512 maskable icon..."
convert -background none favicon.svg -resize 410x410 -gravity center -extent 512x512 icon-maskable-512.png

echo "✅ All icons generated successfully!"
echo ""
echo "📋 Generated files:"
ls -lh icon-*.png apple-touch-icon.png 2>/dev/null
echo ""
echo "💡 Note: Screenshots need to be created manually by taking screenshots of your app"
echo "   - screenshot-wide.png (1280x720) - for desktop/tablet"
echo "   - screenshot-mobile.png (750x1334) - for mobile devices"
