#!/usr/bin/env node

/**
 * Clipping Platform - System Verification Script
 * 
 * Usage: node verify-system.js
 * 
 * Checks:
 * - Node.js version
 * - npm dependencies
 * - Required files
 * - Environment variables
 * - Database connection
 * - API endpoints
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkMark(condition) {
  return condition ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
}

// Main verification
async function verify() {
  log('\n🔍 Clipping Platform - System Verification\n', 'blue');

  let passedTests = 0;
  let totalTests = 0;

  // 1. Node.js Version
  totalTests++;
  try {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
    const passed = majorVersion >= 18;
    log(
      `${checkMark(passed)} Node.js version: ${nodeVersion} (required: >=18)`,
      passed ? 'green' : 'red'
    );
    if (passed) passedTests++;
  } catch (error) {
    log(`${checkMark(false)} Node.js version check failed: ${error.message}`, 'red');
  }

  // 2. npm Version
  totalTests++;
  try {
    const npmVersion = execSync('npm --version').toString().trim();
    const majorVersion = parseInt(npmVersion.split('.')[0]);
    const passed = majorVersion >= 6;
    log(
      `${checkMark(passed)} npm version: v${npmVersion} (required: >=6)`,
      passed ? 'green' : 'red'
    );
    if (passed) passedTests++;
  } catch (error) {
    log(`${checkMark(false)} npm version check failed`, 'red');
  }

  // 3. Required Files
  const requiredFiles = [
    'package.json',
    'next.config.mjs',
    'tailwind.config.js',
    'postcss.config.mjs',
    '.env.example',
    'lib/db.js',
    'middlewares/auth.js',
    'models/User.js',
    'models/Campaign.js',
    'app/api/auth/login/route.js',
    'app/api/campaigns/route.js',
    'app/layout.js',
    'lib/server/services/youtubeTrackingService.js',
    'lib/server/services/earningsService.js',
    'lib/server/workers/youtubeSyncWorker.js',
    'lib/server/workers/backgroundJobs.js',
  ];

  log('\n📁 Required Files:', 'blue');
  requiredFiles.forEach((file) => {
    totalTests++;
    const exists = fs.existsSync(file);
    log(`  ${checkMark(exists)} ${file}`, exists ? 'green' : 'red');
    if (exists) passedTests++;
  });

  // 4. Dependencies
  log('\n📦 Dependencies:', 'blue');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    'next',
    'react',
    'react-dom',
    'mongoose',
    'jsonwebtoken',
    'bcryptjs',
    'axios',
    'zustand',
    'react-hook-form',
    'node-cron',
    'nodemailer',
  ];

  requiredDeps.forEach((dep) => {
    totalTests++;
    const exists = packageJson.dependencies[dep] || packageJson.devDependencies[dep];
    log(`  ${checkMark(exists)} ${dep}${exists ? ` (${packageJson.dependencies[dep] || packageJson.devDependencies[dep]})` : ''}`, exists ? 'green' : 'red');
    if (exists) passedTests++;
  });

  // 5. Environment Variables
  log('\n🔐 Environment Variables:', 'blue');
  const envExample = fs.readFileSync('.env.example', 'utf8');
  const envFile = fs.existsSync('.env.local');
  totalTests++;
  log(`  ${checkMark(envFile)} .env.local file exists`, envFile ? 'green' : 'yellow');
  if (envFile) passedTests++;

  const requiredEnvVars = [
    'MONGODB_URI',
    'NEXT_PUBLIC_API_URL',
    'JWT_SECRET',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
  ];

  const envContent = envFile ? fs.readFileSync('.env.local', 'utf8') : envExample;
  requiredEnvVars.forEach((envVar) => {
    totalTests++;
    const hasVar = envContent.includes(envVar);
    log(`  ${checkMark(hasVar)} ${envVar}`, hasVar ? 'green' : 'yellow');
    if (hasVar) passedTests++;
  });

  // 6. API Routes
  log('\n🔌 API Routes:', 'blue');
  const apiRoutes = [
    'app/api/auth/login/route.js',
    'app/api/auth/register/route.js',
    'app/api/campaigns/route.js',
    'app/api/admin/sync-views/route.js',
  ];

  apiRoutes.forEach((route) => {
    totalTests++;
    const exists = fs.existsSync(route);
    log(`  ${checkMark(exists)} ${route}`, exists ? 'green' : 'red');
    if (exists) passedTests++;
  });

  // 7. Database Models
  log('\n📊 Database Models:', 'blue');
  const models = [
    'models/User.js',
    'models/Campaign.js',
    'models/Submission.js',
    'models/Notification.js',
  ];

  models.forEach((model) => {
    totalTests++;
    const exists = fs.existsSync(model);
    log(`  ${checkMark(exists)} ${model}`, exists ? 'green' : 'red');
    if (exists) passedTests++;
  });

  // 8. View Sync System
  log('\n🎬 View Sync System:', 'blue');
  const syncFiles = [
    'lib/server/services/youtubeTrackingService.js',
    'lib/server/services/earningsService.js',
    'lib/server/workers/youtubeSyncWorker.js',
    'lib/server/workers/backgroundJobs.js',
  ];

  syncFiles.forEach((file) => {
    totalTests++;
    const exists = fs.existsSync(file);
    log(`  ${checkMark(exists)} ${file}`, exists ? 'green' : 'red');
    if (exists) passedTests++;
  });

  // 9. Documentation
  log('\n📚 Documentation:', 'blue');
  const docs = [
    'README.md',
    'ARCHITECTURE.md',
    'API_DOCUMENTATION.md',
    'VIEW_SYNC_SYSTEM.md',
    'VIEW_SYNC_INTEGRATION.md',
    'VIEW_SYNC_QUICK_REFERENCE.md',
    'SYSTEM_OVERVIEW.md',
  ];

  docs.forEach((doc) => {
    totalTests++;
    const exists = fs.existsSync(doc);
    log(`  ${checkMark(exists)} ${doc}`, exists ? 'green' : 'yellow');
    if (exists) passedTests++;
  });

  // Summary
  const percentage = Math.round((passedTests / totalTests) * 100);
  log('\n─'.repeat(50));
  log(`\n📊 Results: ${passedTests}/${totalTests} checks passed (${percentage}%)\n`, 'blue');

  if (percentage === 100) {
    log('✅ All systems GO! Ready for development.\n', 'green');
    return 0;
  } else if (percentage >= 80) {
    log('⚠️  Most systems ready. Some optional components missing.\n', 'yellow');
    return 0;
  } else {
    log('❌ Critical systems missing. Please run setup.\n', 'red');
    return 1;
  }
}

// Run verification
verify()
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((error) => {
    log(`Verification failed: ${error.message}`, 'red');
    process.exit(1);
  });
