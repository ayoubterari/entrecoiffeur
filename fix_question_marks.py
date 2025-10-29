#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import re

# Files to fix
files_to_fix = [
    ('frontend/src/pages/ProductDetail.css', [
        (r'content: "\\?\\?";', 'content: "👤";'),
    ]),
    ('frontend/src/index.css', [
        (r'content: "\\?\\?";', 'content: "👤";'),
        (r'content: "\\?\\?\\?";', 'content: "🛍️";'),
    ]),
    ('frontend/src/pages/Explore.module.css', [
        (r"content: '\\?\\?';", "content: '🔍';"),
    ]),
    ('frontend/src/components/AffiliateTab.css', [
        (r"content: '\\?\\?';", "content: '💰';"),
    ]),
]

for filepath, replacements in files_to_fix:
    full_path = filepath
    if not os.path.exists(full_path):
        print(f"❌ File not found: {full_path}")
        continue
    
    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        for pattern, replacement in replacements:
            content = re.sub(pattern, replacement, content)
        
        if content != original_content:
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Fixed: {filepath}")
        else:
            print(f"⚠️  No changes needed: {filepath}")
    except Exception as e:
        print(f"❌ Error processing {filepath}: {e}")

print("\n✨ Done!")
