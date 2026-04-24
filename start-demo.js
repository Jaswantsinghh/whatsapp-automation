const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting WhatsApp Webhook Dashboard Demo');
console.log('===========================================\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

function log(message, color = 'blue') {
  console.log(`${colors[color]}[${new Date().toLocaleTimeString()}]${colors.reset} ${message}`);
}

function startBackend() {
  return new Promise((resolve, reject) => {
    log('Starting backend server...', 'blue');

    const backend = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, 'backend'),
      stdio: 'inherit',
      shell: true
    });

    backend.on('error', (err) => {
      log(`Backend error: ${err.message}`, 'red');
      reject(err);
    });

    // Give backend time to start
    setTimeout(() => {
      log('Backend started on http://localhost:3001', 'green');
      resolve(backend);
    }, 5000);

    return backend;
  });
}

function startFrontend() {
  return new Promise((resolve, reject) => {
    log('Starting frontend server...', 'blue');

    const frontend = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, 'frontend'),
      stdio: 'inherit',
      shell: true
    });

    frontend.on('error', (err) => {
      log(`Frontend error: ${err.message}`, 'red');
      reject(err);
    });

    setTimeout(() => {
      log('Frontend started on http://localhost:3000', 'green');
      resolve(frontend);
    }, 3000);

    return frontend;
  });
}

async function main() {
  let backendProcess, frontendProcess;

  try {
    // Start backend first
    backendProcess = await startBackend();

    // Then start frontend
    frontendProcess = await startFrontend();

    log('\n🎉 Demo started successfully!', 'green');
    log('📊 Dashboard: http://localhost:3000', 'green');
    log('🔌 API: http://localhost:3001', 'green');
    log('📋 Health Check: http://localhost:3001/health\n', 'green');

    log('Demo Credentials:', 'yellow');
    log('• Admin: demo@whatsapp-webhook.com / demo123', 'yellow');
    log('• Agent: agent1@whatsapp-webhook.com / demo123\n', 'yellow');

    log('Press Ctrl+C to stop all services', 'blue');

  } catch (error) {
    log(`Failed to start services: ${error.message}`, 'red');
    process.exit(1);
  }

  // Cleanup function
  const cleanup = () => {
    log('\nShutting down services...', 'yellow');

    if (backendProcess) {
      backendProcess.kill('SIGTERM');
    }

    if (frontendProcess) {
      frontendProcess.kill('SIGTERM');
    }

    process.exit(0);
  };

  // Handle cleanup on exit
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

main().catch(error => {
  log(`Startup error: ${error.message}`, 'red');
  process.exit(1);
});