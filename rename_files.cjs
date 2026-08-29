const fs = require('fs');
const path = require('path');

const renameRecursive = (dir) => {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    let newPath = fullPath;
    if (item.includes('city') || item.includes('cities') || item.includes('City')) {
      let newItem = item.replace(/city/g, 'settlement')
                        .replace(/cities/g, 'settlements')
                        .replace(/City/g, 'Settlement')
                        .replace(/Cities/g, 'Settlements');
      newPath = path.join(dir, newItem);
      fs.renameSync(fullPath, newPath);
      console.log(`Renamed: ${fullPath} -> ${newPath}`);
    }
    if (fs.lstatSync(newPath).isDirectory()) {
      renameRecursive(newPath);
    }
  }
};

renameRecursive(path.join(__dirname, 'src/modules/states/components'));
renameRecursive(path.join(__dirname, 'src/modules/states/pages'));
