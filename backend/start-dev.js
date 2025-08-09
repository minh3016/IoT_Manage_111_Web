// Simple development startup script
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Cooling Manager Backend Development Server...\n');

// Set environment variables for development
process.env.NODE_ENV = 'development';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/cooling_manager?schema=public';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development-only';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-for-development-only';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
process.env.PORT = process.env.PORT || '5000';

console.log('📋 Configuration:');
console.log(`   - Environment: ${process.env.NODE_ENV}`);
console.log(`   - Port: ${process.env.PORT}`);
console.log(`   - CORS Origin: ${process.env.CORS_ORIGIN}`);
console.log(`   - Database: ${process.env.DATABASE_URL.replace(/\/\/.*@/, '//***:***@')}`);
console.log('');

// Start the server
const serverProcess = spawn('node', ['dist/server.js'], {
  stdio: 'inherit',
  env: process.env,
  cwd: __dirname
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Server exited with code ${code}`);
    process.exit(code);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  serverProcess.kill('SIGTERM');
});
