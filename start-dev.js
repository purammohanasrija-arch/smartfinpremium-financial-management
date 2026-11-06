import { spawn } from 'child_process';

console.log('=================================================');
console.log('🚀 Starting SmartFin+ Ecosystem...');
console.log('=================================================');

// 1. Spawn Backend API Server (Port 5000)
console.log('🔌 Spawning Backend API Server (http://localhost:5000)...');
const backend = spawn('npm', ['--prefix', 'backend', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true,
});

// 2. Spawn Frontend Vite Server (Port 5173)
console.log('💻 Spawning Frontend Application (http://localhost:5173)...');
const frontend = spawn('npm', ['--prefix', 'frontend', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true,
});

backend.on('error', (err) => {
  console.error('[SmartFin+ Backend Error]:', err);
});

frontend.on('error', (err) => {
  console.error('[SmartFin+ Frontend Error]:', err);
});

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
