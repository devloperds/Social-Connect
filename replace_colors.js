const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let count = 0;
walkDir('./src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Indigo -> Teal
    content = content.replace(/indigo-200\/50/g, 'teal-200/50');
    content = content.replace(/indigo-300\/60/g, 'teal-300/60');
    content = content.replace(/indigo-300/g, 'teal-300');
    content = content.replace(/indigo-200/g, 'teal-200');
    content = content.replace(/indigo-600/g, 'teal-600');
    content = content.replace(/indigo-700/g, 'teal-700');
    content = content.replace(/indigo-500/g, 'teal-500');
    content = content.replace(/indigo-50\/80/g, 'teal-50/80');
    content = content.replace(/indigo-100\/80/g, 'teal-100/80');
    content = content.replace(/indigo-50/g, 'teal-50');
    
    // Purple -> Cyan
    content = content.replace(/purple-200\/40/g, 'cyan-200/40');
    content = content.replace(/purple-100\/30/g, 'cyan-100/30');
    
    // Pink -> Sky
    content = content.replace(/pink-100\/30/g, 'sky-100/30');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated: ' + filePath);
      count++;
    }
  }
});
console.log(`Updated ${count} files.`);
