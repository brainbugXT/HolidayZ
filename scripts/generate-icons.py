#!/usr/bin/env python3
"""
Generate PWA icons from HolidayZ source image
Creates all required icon sizes for PWA, favicon, and app icons
Requires: pip install pillow (usually pre-installed)
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("❌ Pillow not installed!")
    print("📦 Install with: pip3 install pillow")
    sys.exit(1)

# Get paths
script_dir = Path(__file__).parent
public_dir = script_dir.parent / 'public'
source_path = public_dir / 'holidayz-icon-source.png'

# Icon sizes to generate
SIZES = [
    ('favicon-16x16.png', 16, False),
    ('favicon-32x32.png', 32, False),
    ('favicon.png', 32, False),  # Fallback favicon
    ('icon-192.png', 192, False),
    ('icon-512.png', 512, False),
    ('icon-maskable-192.png', 192, True),  # 10% padding for maskable
    ('icon-maskable-512.png', 512, True),  # 10% padding for maskable
    ('apple-touch-icon.png', 180, False),
]

def generate_icon(source, size, output_name, is_maskable=False):
    """Generate a PNG icon from source image"""
    print(f"📱 Creating {output_name} ({size}x{size})...")
    
    if is_maskable:
        # Create maskable icon with white background and 10% padding
        padding = int(size * 0.1)
        icon_size = size - (2 * padding)
        
        # Create white background
        background = Image.new('RGBA', (size, size), (255, 255, 255, 255))
        
        # Resize source to fit with padding
        resized = source.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
        
        # Paste icon onto background
        background.paste(resized, (padding, padding), resized)
        final_img = background
    else:
        # Regular icon with transparency
        final_img = source.resize((size, size), Image.Resampling.LANCZOS)
    
    # Save
    output_path = public_dir / output_name
    final_img.save(output_path, 'PNG', optimize=True)
    
    # Show file size
    size_kb = output_path.stat().st_size / 1024
    print(f"✅ Created {output_name} ({size_kb:.1f} KB)")

def main():
    print("🎨 Generating PWA icons from holidayz-icon-source.png...")
    
    if not source_path.exists():
        print(f"❌ Source file not found: {source_path}")
        print("💡 Please save your icon as: public/holidayz-icon-source.png")
        sys.exit(1)
    
    # Load source image
    source = Image.open(source_path)
    print(f"✅ Loaded source image: {source.size[0]}x{source.size[1]}")
    
    # Ensure source has alpha channel
    if source.mode != 'RGBA':
        source = source.convert('RGBA')
    
    # Generate all required icons
    for filename, size, is_maskable in SIZES:
        generate_icon(source, size, filename, is_maskable)
    
    print("\n✨ All icons generated successfully!")
    print("\n📦 Generated files:")
    print("  - favicon-16x16.png, favicon-32x32.png, favicon.png")
    print("  - icon-192.png, icon-512.png (PWA icons)")
    print("  - icon-maskable-192.png, icon-maskable-512.png (Maskable PWA icons)")
    print("  - apple-touch-icon.png (Apple devices)")

if __name__ == '__main__':
    main()
