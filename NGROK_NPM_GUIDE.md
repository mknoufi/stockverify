# 🚀 Ngrok NPM Package Integration

## ✅ Installed!

Your backend now uses the **[ngrok npm package](https://github.com/bubenshchykov/ngrok)** for easier, programmatic ngrok management.

### Benefits of NPM Package:

- ✅ **No separate CLI installation** - works as Node.js module
- ✅ **Programmatic control** - start/stop from code
- ✅ **Better integration** - automatic URL updates
- ✅ **Cleaner code** - no shell scripts needed
- ✅ **Cross-platform** - works everywhere Node.js works

## 🎯 Quick Start

### Option 1: Simple Start (Recommended)

```bash
cd backend
npm run ngrok
```

This will:
1. Start your backend server on port 8080
2. Create ngrok tunnel automatically
3. Display your public URL
4. Update app.json with the URL

### Option 2: Test Configuration First

```bash
cd backend
node test-ngrok.js
```

Check your setup before starting.

## 📝 Configuration

Edit `backend/.env.production`:

```bash
# Required for persistent tunnels
NGROK_AUTH_TOKEN=your_token_here

# Optional settings
NGROK_REGION=us          # us, eu, ap, au, sa, jp, in
NGROK_SUBDOMAIN=myapp    # Requires paid plan
NGROK_DOMAIN=myapp.ngrok-free.app  # Free static domain
```

### Get Your Token

1. **Sign up**: https://dashboard.ngrok.com/signup
2. **Get token**: https://dashboard.ngrok.com/get-started/your-authtoken
3. **Add to config**: `NGROK_AUTH_TOKEN=your_token`

## 🎨 Usage Examples

### Start with Ngrok

```bash
# Method 1: NPM script
npm run ngrok

# Method 2: Direct
node start-with-ngrok.js

# Method 3: Bash wrapper (old way still works)
bash ../start-all.sh
```

### Programmatic Usage

```javascript
const ngrokManager = require('./ngrok-manager');

// Connect
const url = await ngrokManager.connect();
console.log('Public URL:', url);

// Get URL anytime
const url = ngrokManager.getUrl();

// Disconnect
await ngrokManager.disconnect();

// Kill all ngrok processes
await ngrokManager.kill();
```

### In Your Code

```javascript
const ngrok = require('ngrok');

// Simple tunnel
const url = await ngrok.connect({
  addr: 8080,
  authtoken: 'your_token',
  region: 'us'
});

// With custom domain (free tier)
const url = await ngrok.connect({
  addr: 8080,
  domain: 'myapp.ngrok-free.app',
  authtoken: 'your_token'
});

// Disconnect
await ngrok.disconnect();
```

## 📊 Features

### Automatic Features:

- ✅ Tunnel creation and management
- ✅ URL saved to `.ngrok.url` file
- ✅ `app.json` auto-updated with public URL
- ✅ Graceful shutdown on Ctrl+C
- ✅ Dashboard accessible at `http://127.0.0.1:4040`

### Configuration Options:

```javascript
{
  addr: 8080,                    // Port to tunnel
  authtoken: 'token',            // Your ngrok token
  region: 'us',                  // Server region
  subdomain: 'myapp',            // Custom subdomain (paid)
  domain: 'myapp.ngrok-free.app',// Static domain (free!)
  proto: 'http',                 // Protocol
  inspect: true,                 // Enable inspection
  onStatusChange: (status) => {}, // Status callback
  onLogEvent: (data) => {}       // Log callback
}
```

## 🆓 Free Static Domain

Ngrok now offers **free static domains**!

### Get Your Free Domain:

1. Sign up: https://dashboard.ngrok.com/signup
2. Go to: https://dashboard.ngrok.com/domains
3. Claim your free domain: `yourname.ngrok-free.app`

### Use It:

```javascript
const url = await ngrok.connect({
  addr: 8080,
  domain: 'yourname.ngrok-free.app',
  authtoken: 'your_token'
});
```

Now your URL stays the same every time! 🎉

## 🔧 Advanced Usage

### Custom Region

```bash
NGROK_REGION=eu  # Europe
NGROK_REGION=ap  # Asia Pacific
NGROK_REGION=au  # Australia
NGROK_REGION=sa  # South America
NGROK_REGION=jp  # Japan
NGROK_REGION=in  # India
```

### Event Callbacks

```javascript
const url = await ngrok.connect({
  addr: 8080,
  authtoken: 'token',
  onStatusChange: (status) => {
    if (status === 'closed') {
      console.log('Tunnel closed!');
    } else if (status === 'connected') {
      console.log('Tunnel reconnected!');
    }
  },
  onLogEvent: (data) => {
    console.log('Ngrok log:', data);
  }
});
```

### Multiple Tunnels

```javascript
const ngrok = require('ngrok');

// Tunnel for backend
const backendUrl = await ngrok.connect({
  addr: 8080,
  name: 'backend',
  authtoken: 'token'
});

// Tunnel for frontend
const frontendUrl = await ngrok.connect({
  addr: 3000,
  name: 'frontend',
  authtoken: 'token'
});
```

## 🛠️ Troubleshooting

### "authtoken" error

Add your token to `.env.production`:
```bash
NGROK_AUTH_TOKEN=your_actual_token
```

### Port already in use

Change the port in `.env.production`:
```bash
PORT=5000  # Or any available port
```

### Can't download ngrok binary

Set proxy if behind corporate firewall:
```bash
export HTTPS_PROXY=http://proxy.company.com:8080
npm install ngrok
```

### Tunnel disconnects

Free tier has session limits. Solutions:
1. Restart tunnel when needed
2. Use static domain (free!)
3. Upgrade to paid plan (no limits)

## 📚 API Reference

### NgrokManager Class

```javascript
const ngrokManager = require('./ngrok-manager');

// Connect to ngrok
await ngrokManager.connect();

// Get current URL
const url = ngrokManager.getUrl();

// Get API URL (dashboard)
const apiUrl = ngrokManager.getApiUrl();

// Disconnect
await ngrokManager.disconnect();

// Kill all processes
await ngrokManager.kill();
```

## 🎯 Quick Commands

```bash
# Start everything with ngrok
npm run ngrok

# Test configuration
node test-ngrok.js

# Just the server (no ngrok)
npm start

# Setup auth token interactively
bash quick-setup.sh

# Stop everything
bash auto-stop.sh
```

## 📖 Resources

- **Ngrok NPM Package**: https://github.com/bubenshchykov/ngrok
- **Ngrok Dashboard**: https://dashboard.ngrok.com
- **Ngrok Docs**: https://ngrok.com/docs
- **Get Free Domain**: https://dashboard.ngrok.com/domains
- **API Documentation**: https://ngrok.com/docs/api

## ✅ Summary

You now have:
- ✅ Ngrok npm package installed
- ✅ Programmatic tunnel management
- ✅ Simple start commands
- ✅ Automatic configuration
- ✅ Free static domain support

**To start:** `npm run ngrok` 🚀
