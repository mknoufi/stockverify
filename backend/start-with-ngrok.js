/**
 * Start backend server with ngrok tunnel
 * Simplified startup script using ngrok npm package
 */

const { spawn } = require('child_process');
const ngrokManager = require('./ngrok-manager');
const { config } = require('./config');

async function startServer() {
  console.log('🚀 Stock Verify - Starting with Ngrok');
  console.log('=====================================\n');

  try {
    // Start the backend server
    console.log(`🚀 Starting backend server on port ${config.port}...`);
    const server = spawn('node', ['server.js'], {
      stdio: 'inherit',
      env: process.env,
    });

    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Start ngrok tunnel
    const url = await ngrokManager.connect();

    console.log('\n=====================================');
    console.log('✅ All services started!');
    console.log('=====================================\n');
    console.log('📊 Services:');
    console.log(`  • Backend:  http://localhost:${config.port}`);
    console.log(`  • Ngrok:    ${url}`);
    console.log(`  • Dashboard: http://127.0.0.1:4040\n`);
    console.log('🛑 Press Ctrl+C to stop all services\n');

    // Handle server exit
    server.on('exit', async (code) => {
      console.log(`\n🛑 Server exited with code ${code}`);
      await ngrokManager.kill();
      process.exit(code);
    });

    // Keep process alive
    process.stdin.resume();

  } catch (error) {
    console.error('\n❌ Failed to start:', error.message);
    process.exit(1);
  }
}

// Start everything
startServer().catch(console.error);
