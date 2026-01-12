/**
 * Quick test script for ngrok setup
 */

const ngrokManager = require('./ngrok-manager');
const { config } = require('./config');

async function test() {
  console.log('🧪 Testing ngrok setup...\n');
  
  console.log('Configuration:');
  console.log(`  Port: ${config.port}`);
  console.log(`  Region: ${config.ngrok.region || 'us'}`);
  console.log(`  Auth Token: ${config.ngrok.authToken ? '✅ Set' : '❌ Not set'}\n`);

  if (!config.ngrok.authToken || config.ngrok.authToken === 'your_token_here') {
    console.log('⚠️  No authtoken configured');
    console.log('   Ngrok will work with limitations (session timeout, random URLs)\n');
    console.log('💡 To configure:');
    console.log('   1. Get token: https://dashboard.ngrok.com/get-started/your-authtoken');
    console.log('   2. Add to .env.production: NGROK_AUTH_TOKEN=your_token');
    console.log('   3. Or run: bash quick-setup.sh\n');
  }

  console.log('To start with ngrok:');
  console.log('  npm run ngrok');
  console.log('  or: node start-with-ngrok.js\n');
}

test().catch(console.error);
