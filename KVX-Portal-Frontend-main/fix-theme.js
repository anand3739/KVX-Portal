const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/hr/HRDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace light mode specific classes with dual mode classes
content = content.replace(/bg-white\/60/g, 'bg-white/60 dark:bg-gray-900/60');
content = content.replace(/bg-white\/80/g, 'bg-white/80 dark:bg-gray-900/80');
content = content.replace(/bg-white\/50/g, 'bg-white/50 dark:bg-gray-900/50');
content = content.replace(/bg-gray-50/g, 'bg-gray-50 dark:bg-gray-800/50');
content = content.replace(/bg-gray-100/g, 'bg-gray-100 dark:bg-gray-800');
content = content.replace(/text-gray-900/g, 'text-gray-900 dark:text-white');
content = content.replace(/text-gray-700/g, 'text-gray-700 dark:text-gray-200');
content = content.replace(/text-gray-600/g, 'text-gray-600 dark:text-gray-300');
content = content.replace(/text-gray-500/g, 'text-gray-500 dark:text-gray-400');
content = content.replace(/border-gray-200/g, 'border-gray-200 dark:border-gray-700');
content = content.replace(/border-gray-100/g, 'border-gray-100 dark:border-gray-800');
content = content.replace(/border-white/g, 'border-white dark:border-gray-800');
content = content.replace(/shadow-gray-200\/50/g, 'shadow-gray-200/50 dark:shadow-black/50');
content = content.replace(/shadow-gray-200\/40/g, 'shadow-gray-200/40 dark:shadow-black/40');
content = content.replace(/bg-white/g, 'bg-white dark:bg-gray-900');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed HRDashboard theme classes');
