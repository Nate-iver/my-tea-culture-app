const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function main() {
  const root = path.join(__dirname, '..');
  const imagesDir = path.join(root, 'images');
  const images2Dir = path.join(root, 'images2');

  const imgs = [];
  const isImage = (name) => /\.(png|jpe?g|gif|webp)$/i.test(name);

  if (fs.existsSync(imagesDir)) {
    const list = fs.readdirSync(imagesDir).filter(isImage).sort();
    list.forEach((f) => imgs.push({ dir: '/images', file: f }));
  }
  if (fs.existsSync(images2Dir)) {
    const list = fs.readdirSync(images2Dir).filter(isImage).sort();
    list.forEach((f) => imgs.push({ dir: '/images2', file: f }));
  }

  if (imgs.length === 0) {
    console.log('未找到 images 或 images2 中的图片文件。');
    process.exit(0);
  }

  const [rows] = await db.execute('SELECT id, cover_image FROM content ORDER BY id');
  let idx = 0;
  for (const row of rows) {
    if (!row.cover_image) {
      if (idx >= imgs.length) {
        console.log('图片数量不足，已分配完可用图片。');
        break;
      }
      const imagePath = `${imgs[idx].dir}/${imgs[idx].file}`;
      await db.execute('UPDATE content SET cover_image = ? WHERE id = ?', [imagePath, row.id]);
      console.log(`content id=${row.id} -> ${imagePath}`);
      idx++;
    }
  }

  console.log('分配完成。');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
