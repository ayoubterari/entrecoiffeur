const fs = require('fs');

const fixes = [
  {
    file: 'frontend/src/pages/ProductDetail.css',
    search: 'content: "??";',
    replace: 'content: "👤";'
  },
  {
    file: 'frontend/src/index.css',
    search: 'content: "??";',
    replace: 'content: "👤";'
  },
  {
    file: 'frontend/src/index.css',
    search: 'content: "???";',
    replace: 'content: "🛍️";'
  }
];

fixes.forEach(({ file, search, replace }) => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes(search)) {
      content = content.split(search).join(replace);
      fs.writeFileSync(file, content, 'utf8');
      console.log(`✅ Fixed ${search} in ${file}`);
    } else {
      console.log(`⚠️  "${search}" not found in ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error with ${file}:`, error.message);
  }
});

console.log('\n✨ All done!');
