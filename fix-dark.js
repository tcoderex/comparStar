const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');

const files = [
  'TabElements.tsx',
  'TabCompare.tsx',
  'TabTemplates.tsx',
  'TabSettings.tsx'
];

files.forEach(file => {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace purely white backgrounds
  content = content.replace(/bg-white/g, 'bg-white dark:bg-slate-900');
  
  // Replace slightly off-white backgrounds
  content = content.replace(/bg-slate-50([^/])/g, 'bg-slate-50 dark:bg-slate-950$1');
  
  // Clean up if it replaced slate-50 in a class like bg-slate-500
  content = content.replace(/dark:bg-slate-9500/g, 'bg-slate-500');

  // Replace text colors
  content = content.replace(/text-slate-900/g, 'text-slate-900 dark:text-white');
  content = content.replace(/text-slate-800/g, 'text-slate-800 dark:text-slate-100');
  content = content.replace(/text-slate-700/g, 'text-slate-700 dark:text-slate-300');
  content = content.replace(/text-slate-500/g, 'text-slate-500 dark:text-slate-400');
  content = content.replace(/text-slate-600/g, 'text-slate-600 dark:text-slate-400');
  
  // Replace borders
  content = content.replace(/border-slate-200/g, 'border-slate-200 dark:border-slate-800');
  content = content.replace(/border-slate-100/g, 'border-slate-100 dark:border-slate-800');

  // Specific hover backgrounds
  content = content.replace(/hover:bg-slate-50([^/])/g, 'hover:bg-slate-50 dark:hover:bg-slate-800$1');

  fs.writeFileSync(filePath, content);
  console.log(`Processed ${file}`);
});
