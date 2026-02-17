#!/usr/bin/env node
/**
 * Copy PDF.js worker to public directory
 * This ensures the worker file is available for self-hosting
 * 
 * IMPORTANT: Must match the version that react-pdf uses internally
 */

const fs = require('fs');
const path = require('path');

// react-pdf uses pdfjs-dist@5.4.296 internally
const sourceFile = path.join(
  __dirname,
  '../../../node_modules/.pnpm/pdfjs-dist@5.4.296/node_modules/pdfjs-dist/build/pdf.worker.min.mjs'
);

const destDir = path.join(__dirname, '../public/pdf-worker');
const destFile = path.join(destDir, 'pdf.worker.min.mjs');

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy the file
try {
  fs.copyFileSync(sourceFile, destFile);
  console.log('✓ PDF.js worker copied to public/pdf-worker/');
} catch (error) {
  console.error('Failed to copy PDF.js worker:', error.message);
  process.exit(1);
}
