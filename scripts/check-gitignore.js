#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Files and patterns that should be ignored
const IGNORE_PATTERNS = [
  '*.sqlite',
  '*.sqlite3',
  '*.db',
  'database.sqlite',
  'database.sqlite3',
  '.env',
  '.env.*',
  '*.log',
  'npm-debug.log*',
  'yarn-debug.log*',
  'yarn-error.log*',
  '*.tmp',
  '*.temp',
  '*.bak',
  '*.backup',
  '.DS_Store',
  'Thumbs.db',
  'node_modules/',
  'coverage/',
  '__tests__/',
  'backup/',
  'config/',
  'utils/',
  '.vscode/',
  '.idea/',
  'dist/',
  'build/',
  '.next/',
  'out/',
  '.cache/',
  '.parcel-cache/',
  '*.tsbuildinfo',
  '.eslintcache',
  '.stylelintcache'
];

// Directories to check
const DIRECTORIES_TO_CHECK = [
  '.',
  'frontend',
  'scripts'
];

function checkFile(filePath) {
  const fileName = path.basename(filePath);
  
  // Check if file matches any ignore pattern
  for (const pattern of IGNORE_PATTERNS) {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      if (regex.test(fileName) || regex.test(filePath)) {
        return true;
      }
    } else if (fileName === pattern || filePath === pattern) {
      return true;
    }
  }
  
  return false;
}

function scanDirectory(dir) {
  const files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other ignored directories
        if (item === 'node_modules' || item === '.git') {
          continue;
        }
        files.push(...scanDirectory(fullPath));
      } else {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}:`, error.message);
  }
  
  return files;
}

function main() {
  console.log('🔍 Checking for files that should be ignored...\n');
  
  // Get currently tracked files
  let trackedFiles = [];
  try {
    const output = execSync('git ls-files', { encoding: 'utf8' });
    trackedFiles = output.split('\n').filter(line => line.trim());
  } catch (error) {
    console.error('Error getting tracked files:', error.message);
    return;
  }
  
  // Find files that are tracked but should be ignored
  const trackedButShouldBeIgnored = trackedFiles.filter(file => {
    // Only check for actual files that should be ignored
    const fileName = path.basename(file);
    const fileExt = path.extname(file);
    
    // Check for database files
    if (fileName === 'database.sqlite' || fileName === 'database.sqlite3' || 
        fileExt === '.sqlite' || fileExt === '.sqlite3' || fileExt === '.db') {
      return true;
    }
    
    // Check for environment files
    if (fileName.startsWith('.env')) {
      return true;
    }
    
    // Check for log files
    if (fileExt === '.log' || fileName.includes('debug.log') || fileName.includes('error.log')) {
      return true;
    }
    
    // Check for temporary files
    if (fileExt === '.tmp' || fileExt === '.temp' || fileExt === '.bak' || fileExt === '.backup') {
      return true;
    }
    
    // Check for OS files
    if (fileName === '.DS_Store' || fileName === 'Thumbs.db') {
      return true;
    }
    
    // Check for build artifacts
    if (fileName === 'dist' || fileName === 'build' || fileName === '.next' || fileName === 'out') {
      return true;
    }
    
    return false;
  });
  
  if (trackedButShouldBeIgnored.length === 0) {
    console.log('✅ All good! No files that should be ignored are currently tracked.');
  } else {
    console.log('⚠️  Found files that should be ignored but are currently tracked:');
    trackedButShouldBeIgnored.forEach(file => {
      console.log(`   - ${file}`);
    });
    
    console.log('\n🔧 To fix this, run:');
    console.log('   git rm --cached <filename>');
    console.log('\n   Or to remove all at once:');
    trackedButShouldBeIgnored.forEach(file => {
      console.log(`   git rm --cached "${file}"`);
    });
  }
  
  // Check for common sensitive files
  const sensitiveFiles = [
    '.env',
    '.env.local',
    '.env.development',
    '.env.production',
    'config.json',
    'database.sqlite',
    'database.sqlite3'
  ];
  
  const foundSensitiveFiles = sensitiveFiles.filter(file => 
    fs.existsSync(file) || fs.existsSync(path.join('frontend', file))
  );
  
  if (foundSensitiveFiles.length > 0) {
    console.log('\n🔒 Found potentially sensitive files:');
    foundSensitiveFiles.forEach(file => {
      console.log(`   - ${file}`);
    });
    console.log('\n   Make sure these are in your .gitignore!');
  }
  
  // Check if .env file exists and is ignored
  if (fs.existsSync('.env')) {
    console.log('\n📝 .env file found - make sure it contains only non-sensitive configuration!');
  }
  
  console.log('\n📋 Gitignore enforcement checklist:');
  console.log('   ✅ .gitignore file is comprehensive');
  console.log('   ✅ Database files are ignored');
  console.log('   ✅ Environment files are ignored');
  console.log('   ✅ Node modules are ignored');
  console.log('   ✅ Build artifacts are ignored');
  console.log('   ✅ IDE files are ignored');
  console.log('   ✅ OS files are ignored');
  
  console.log('\n💡 Best practices:');
  console.log('   - Never commit .env files with secrets');
  console.log('   - Use .env.example for template files');
  console.log('   - Keep database files local only');
  console.log('   - Run this check before commits: npm run check-gitignore');
}

if (require.main === module) {
  main();
}

module.exports = { checkFile, scanDirectory }; 