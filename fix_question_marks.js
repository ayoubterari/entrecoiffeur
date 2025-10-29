const fs = require('fs');
const path = require('path');

const filesToFix = [
  {
    path: 'frontend/src/pages/ProductDetail.css',
    replacements: [
      { from: /content: "\\?\\?";/g, to: 'content: "👤";' }
    ]
  },
  {
    path: 'frontend/src/index.css',
    replacements: [
      { from: /content: "\\?\\?";/g, to: 'content: "👤";' },
      { from: /content: "\\?\\?\\?";/g, to: 'content: "🛍️";' }
    ]
  },
  {
    path: 'frontend/src/pages/Explore.module.css',
    replacements: [
      { from: /content: '\\?\\?';/g, to: "content: '🔍';" }
    ]
  },
  {
    path: 'frontend/src/components/AffiliateTab.css',
    replacements: [
      { from: /content: '\\?\\?';/g, to: "content: '💰';" }
    ]
  }
];

filesToFix.forEach(({ path: filePath, replacements }) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    replacements.forEach(({ from, to }) => {
      content = content.replace(from, to);
    });
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    } else {
      console.log(`⚠️  No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log('\n✨ Done!');
