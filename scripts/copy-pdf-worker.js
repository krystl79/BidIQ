const fs = require('fs');
const path = require('path');

// Source path (node_modules/react-pdf)
const sourcePath = path.join(__dirname, '../node_modules/react-pdf/dist/pdf.worker.min.js');

// Destination path (public directory)
const destPath = path.join(__dirname, '../public/pdf.worker.min.js');

// Copy the file
fs.copyFileSync(sourcePath, destPath);

console.log('PDF.js worker file copied successfully!'); 