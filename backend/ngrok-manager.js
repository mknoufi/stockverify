/**
 * Ngrok Manager - Programmatic ngrok control
 * Uses the ngrok npm package for easier management
 */

const ngrok = require('ngrok');
const fs = require('fs');
const path = require('path');

// Load configuration
const { config } = require('./config');

class NgrokManager {
  constructor() {
    this.url = null;
    this.connected = false;
  }

  /**
   * Connect to ngrok and create a tunnel
   */
  async connect() {
    try {
      console.log('📡 Starting ngrok tunnel...');
      
      const options = {
        addr: config.port,
        region: config.ngrok.region || 'us',
      };

      // Add authtoken if available
      if (config.ngrok.authToken && config.ngrok.authToken !== 'your_token_here') {
        options.authtoken = config.ngrok.authToken;
        console.log('   ✅ Using authtoken');
      } else {
        console.log('   ⚠️  No authtoken - tunnel will have limitations');
        console.log('   Get token: https://dashboard.ngrok.com/get-started/your-authtoken');
      }

      // Add subdomain if available (requires paid plan)
      if (config.ngrok.subdomain) {
        options.subdomain = config.ngrok.subdomain;
      }

      // Add custom domain if available (requires paid plan)
      if (config.ngrok.domain) {
        options.domain = config.ngrok.domain;
      }

      // Connect to ngrok
      this.url = await ngrok.connect(options);
      this.connected = true;

      console.log(`✅ Ngrok tunnel active: ${this.url}`);
      
      // Save URL to file
      this.saveUrl(this.url);
      
      // Update app.json with the URL
      await this.updateAppJson(this.url);

      return this.url;
    } catch (error) {
      console.error('❌ Failed to start ngrok:', error.message);
      
      if (error.message.includes('authtoken')) {
        console.log('');
        console.log('💡 Quick fix:');
        console.log('   1. Get token: https://dashboard.ngrok.com/get-started/your-authtoken');
        console.log('   2. Add to backend/.env.production: NGROK_AUTH_TOKEN=your_token');
        console.log('   3. Or run: cd backend && bash quick-setup.sh');
      }
      
      throw error;
    }
  }

  /**
   * Disconnect from ngrok
   */
  async disconnect() {
    if (this.connected) {
      try {
        await ngrok.disconnect();
        console.log('🛑 Ngrok tunnel disconnected');
        this.connected = false;
        this.url = null;
      } catch (error) {
        console.error('Error disconnecting ngrok:', error.message);
      }
    }
  }

  /**
   * Kill all ngrok processes
   */
  async kill() {
    try {
      await ngrok.kill();
      console.log('🛑 Ngrok process killed');
      this.connected = false;
      this.url = null;
    } catch (error) {
      console.error('Error killing ngrok:', error.message);
    }
  }

  /**
   * Get current ngrok URL
   */
  getUrl() {
    return this.url || ngrok.getUrl();
  }

  /**
   * Get ngrok API URL
   */
  getApiUrl() {
    return ngrok.getUrl() || 'http://127.0.0.1:4040';
  }

  /**
   * Save URL to file
   */
  saveUrl(url) {
    try {
      const urlFile = path.join(__dirname, '.ngrok.url');
      fs.writeFileSync(urlFile, url);
    } catch (error) {
      console.error('Error saving URL:', error.message);
    }
  }

  /**
   * Update app.json with ngrok URL
   */
  async updateAppJson(url) {
    try {
      const appJsonPath = path.join(__dirname, '..', 'app.json');
      
      if (fs.existsSync(appJsonPath)) {
        const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
        
        if (appJson.expo && appJson.expo.extra) {
          appJson.expo.extra.apiUrl = url;
          fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
          console.log('✅ app.json updated with ngrok URL');
        }
      }
    } catch (error) {
      console.error('Warning: Could not update app.json:', error.message);
    }
  }
}

// Export singleton instance
const ngrokManager = new NgrokManager();

// Cleanup on exit
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down ngrok...');
  await ngrokManager.kill();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await ngrokManager.kill();
  process.exit(0);
});

module.exports = ngrokManager;
