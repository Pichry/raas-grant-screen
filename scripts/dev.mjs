import { spawn } from 'node:child_process';
import process from 'node:process';

const port = process.env.PORT || '8444';
const backendPort = process.env.BACKEND_PORT || '4000';

function run(command, args, name) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: false,
    env: process.env,
  });

  child.on('exit', (code, signal) => {
    if (code !== 0 && signal !== 'SIGTERM') {
      console.error(`${name} exited with code ${code ?? signal ?? 'unknown'}`);
    }
    process.exit(code ?? 1);
  });

  return child;
}

console.log(`Starting RAAS local stack on frontend port ${port} and backend port ${backendPort}...`);

const backend = run('node', ['server/index.js'], 'backend');
const frontend = run('npx', ['vite', '--host', '0.0.0.0', '--port', String(port)], 'frontend');

const shutdown = () => {
  backend.kill('SIGTERM');
  frontend.kill('SIGTERM');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
