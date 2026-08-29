const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'modules', 'states', 'types', 'states.types.ts');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/ICity/g, 'ISettlement');
content = content.replace(/City/g, 'Settlement');
content = content.replace(/city/g, 'settlement');
content = content.replace(/cities/g, 'settlements');

fs.writeFileSync(filePath, content);
console.log('Fixed states.types.ts');
