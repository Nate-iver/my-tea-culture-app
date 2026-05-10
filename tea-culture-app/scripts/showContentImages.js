const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function main() {
  const root = path.join(__dirname, '..');
  const imagesDir = path.join(root, 'images');
  const images2Dir = path.join(root, 'images2');

  const [rows] = await db.execute('SELECT id, title, cover_image FROM content ORDER BY id');
  console.log('id | title | cover_image | exists_in_images | exists_in_images2');
  for (const r of rows) {
    const cover = r.cover_image || '';
    const base = path.basename(cover);
    const existsImages = base ? fs.existsSync(path.join(imagesDir, base)) : false;
    const existsImages2 = base ? fs.existsSync(path.join(images2Dir, base)) : false;
    console.log(`${r.id} | ${r.title} | ${cover} | ${existsImages} | ${existsImages2}`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
