const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'modules', 'states', 'services', 'states.service.ts');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/cities/g, 'settlements');

fs.writeFileSync(filePath, content);
console.log('Fixed states.service.ts');
