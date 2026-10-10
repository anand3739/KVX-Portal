const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/pages/hr/HRDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix corrupted classes
content = content.replace(/bg-white dark:bg-gray-900\/60 dark:bg-gray-900\/60/g, 'bg-white/60 dark:bg-gray-900/60');
content = content.replace(/bg-white dark:bg-gray-900\/80 dark:bg-gray-900\/80/g, 'bg-white/80 dark:bg-gray-900/80');
content = content.replace(/bg-white dark:bg-gray-900\/50 dark:bg-gray-900\/50/g, 'bg-white/50 dark:bg-gray-900/50');

// Fix broken borders
content = content.replace(/border-white dark:border-gray-800/g, 'border-white/50 dark:border-gray-800/50');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed HRDashboard corrupted classes');
