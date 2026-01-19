#!/usr/bin/env python3
"""
Generate PWA icons from SVG using Python
Requires: pip install cairosvg pillow
"""

import os
from pathlib import Path

try:
    import cairosvg
    from PIL import Image
    from io import BytesIO
except ImportError:
    print("❌ Required packages not installed!")
    print("📦 Install with: pip3 install cairosvg pillow")
    exit(1)

# Get paths
script_dir = Path(__file__).parent
public_dir = script_dir.parent / 'public'
svg_path = public_dir / 'favicon.svg'

def generate_icon(size, output_name, padding=0):
    """Generate a PNG icon from SVG"""
    print(f"📱 Creating {output_name} ({size}x{size})...")
    
    # Calculate actual size with padding
    actual_size = int(size * (1 - padding * 2))
    offset = int(size * padding)
    
    # Convert SVG to PNG
    png_data = cairosvg.svg2png(
        url=str(svg_path),
        output_width=actual_size,
        output_height=actual_size
    )
    
    # Open as PIL Image
    img = Image.open(BytesIO(png_data))
    
    # Create final image with padding if needed
    if padding > 0:
        final_img = Image.new('RGBA', (size, size), (255, 255, 255, 255))
        final_img.paste(img, (offset, offset), img)
    else:
        final_img = img
    
    # Save
    output_path = public_dir / output_name
    final_img.save(output_path, 'PNG')
    print(f"✅ Created {output_name}")

def main():
    print("🎨 Generating PWA icons from favicon.svg...")
    
    if not svg_path.exists():
        print(f"❌ SVG file not found: {svg_path}")
        exit(1)
    
    # Generate all required icons
    icons = [
        (192, 'icon-192.png', 0),
        (512, 'icon-512.png', 0),
        (192, 'icon-maskable-192.png', 0.1),
        (512, 'icon-maskable-512.png', 0.1),
        (180, 'apple-touch-icon.png', 0),
    ]
    
    for size, name, padding in icons:
        generate_icon(size, name, padding)
    
    print("\n✨ All icons generated successfully!")
    print("\n📋 Generated files:")
    for _, name, _ in icons:
        file_path = public_dir / name
        if file_path.exists():
            size_kb = file_path.stat().st_size / 1024
            print(f"   {name} - {size_kb:.1f} KB")

if __name__ == '__main__':
    main()
