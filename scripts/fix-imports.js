#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Map of path aliases to their bundled locations
const aliasMap = {
  '@/file': './file',
  '@/log': './log',
  '@/util': './util',
  '@/command': './command',
  '@/types': './types',
  '@/mocks': './mocks',
  '@/verdaccio': './verdaccio'
};

// Function to get all JS files recursively
function getAllJsFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllJsFiles(fullPath, files);
    } else if (entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to replace imports in a file
function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Calculate relative path from this file to the bundled packages
  const distDir = path.join(__dirname, '../dist/plugins/nx-cmaker');
  const fileDir = path.dirname(filePath);
  const relativePathToRoot = path.relative(fileDir, distDir);

  for (const [alias, packageName] of Object.entries(aliasMap)) {
    const regex = new RegExp(`require\\(['"]${alias}['"]\\)`, 'g');
    if (content.match(regex)) {
      // Calculate the correct relative path
      const relativePath = path.join(relativePathToRoot, packageName.slice(2)); // Remove './' from packageName
      const normalizedPath = relativePath.split(path.sep).join('/'); // Ensure forward slashes
      content = content.replace(regex, `require('${normalizedPath}')`);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed imports in: ${filePath}`);
  }
}

// Copy internal packages to dist
function copyInternalPackages() {
  const packages = ['file', 'log', 'util', 'command', 'types'];
  
  for (const pkg of packages) {
    const srcDir = path.join(__dirname, '../dist/packages', pkg, 'src');
    const destDir = path.join(__dirname, '../dist/plugins/nx-cmaker', pkg);
    
    if (fs.existsSync(srcDir)) {
      // Create destination directory
      fs.mkdirSync(destDir, { recursive: true });
      
      // Copy all files
      fs.cpSync(srcDir, destDir, { recursive: true });
      console.log(`Copied ${pkg} to dist`);
      
      // Create package.json for the bundled module
      const pkgJson = {
        name: pkg,
        main: 'index.js'
      };
      fs.writeFileSync(path.join(destDir, 'package.json'), JSON.stringify(pkgJson, null, 2));
    }
  }
}

// Main
console.log('Fixing imports and bundling internal dependencies...');

// Copy internal packages
copyInternalPackages();

// Fix imports in all JS files
const distDir = path.join(__dirname, '../dist/plugins/nx-cmaker');
const jsFiles = getAllJsFiles(distDir);
jsFiles.forEach(fixImportsInFile);

console.log('Done!');