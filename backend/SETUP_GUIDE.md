# Stock Verify System - Complete Setup Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLOUD                                       │
│                                                                          │
│    ┌──────────────────────────────────────────────────────────────┐    │
│    │                    Vibecode App (Mobile)                      │    │
│    │                    Running on Port 8081                       │    │
│    └──────────────────────────────────────────────────────────────┘    │
│                                  │                                       │
│                                  │ HTTPS Request                        │
│                                  ▼                                       │
└──────────────────────────────────┼──────────────────────────────────────┘
                                   │
                                   │ Internet
                                   │
┌──────────────────────────────────┼──────────────────────────────────────┐
│                           YOUR LOCAL NETWORK                             │
│                                  │                                       │
│                                  ▼                                       │
│    ┌──────────────────────────────────────────────────────────────┐    │
│    │                     ngrok Tunnel                              │    │
│    │           https://abc123.ngrok-free.app                       │    │
│    │                    ↓ forwards to ↓                            │    │
│    │                  localhost:8001                               │    │
│    └──────────────────────────────────────────────────────────────┘    │
│                                  │                                       │
│                                  ▼                                       │
│    ┌──────────────────────────────────────────────────────────────┐    │
│    │                  Python Backend (FastAPI)                     │    │
│    │                  Running on Port 8001                         │    │
│    │                                                               │    │
│    │  • Receives API requests from mobile app                     │    │
│    │  • Queries SQL Server for ERP data                           │    │
│    │  • Stores sessions/counts in MongoDB                         │    │
│    └──────────────────────────────────────────────────────────────┘    │
│                          │                    │                          │
│                          ▼                    ▼                          │
│    ┌────────────────────────────┐  ┌────────────────────────────┐      │
│    │      SQL Server            │  │        MongoDB              │      │
│    │      Port 1433             │  │       Port 27017            │      │
│    │                            │  │                             │      │
│    │  • ERP Items data          │  │  • Sessions                 │      │
│    │  • Stock levels            │  │  • Count entries            │      │
│    │  • Product info            │  │  • Sync queue               │      │
│    └────────────────────────────┘  └────────────────────────────┘      │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

Before starting, ensure you have:

| Requirement | Version | Download Link |
|-------------|---------|---------------|
| Python | 3.9 or higher | https://python.org/downloads |
| SQL Server | 2017+ | Already installed |
| MongoDB | 6.0+ | https://mongodb.com/try/download/community |
| ngrok | Latest | https://ngrok.com/download |

---

## Step 1: Install Python

### Windows

1. Download Python from https://python.org/downloads
2. Run the installer
3. **IMPORTANT**: Check "Add Python to PATH" during installation
4. Click "Install Now"
5. Verify installation:
   ```cmd
   python --version
   ```
   Should show: `Python 3.x.x`

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv
python3 --version
```

### Mac

```bash
brew install python3
python3 --version
```

---

## Step 2: Install MongoDB

### Windows

1. Download MongoDB Community Server from https://mongodb.com/try/download/community
2. Choose "Windows" and "MSI" package
3. Run the installer
4. Select "Complete" installation
5. Check "Install MongoDB as a Service"
6. Complete installation
7. MongoDB starts automatically on port 27017

### Linux (Ubuntu)

```bash
# Import MongoDB public GPG key
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
mongosh --eval "db.version()"
```

### Mac

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

---

## Step 3: Install SQL Server ODBC Driver

### Windows

1. Download "ODBC Driver 17 for SQL Server" from:
   https://docs.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server

2. Run the installer and complete installation

### Linux (Ubuntu)

```bash
# Add Microsoft repository
curl https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -
curl https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/prod.list | sudo tee /etc/apt/sources.list.d/mssql-release.list

# Install ODBC driver
sudo apt update
sudo ACCEPT_EULA=Y apt install -y msodbcsql17 unixodbc-dev
```

### Mac

```bash
brew install unixodbc freetds
```

---

## Step 4: Configure SQL Server for Remote Access

### 4.1 Enable TCP/IP Protocol

1. Open **SQL Server Configuration Manager**
2. Navigate to: SQL Server Network Configuration → Protocols for MSSQLSERVER
3. Right-click **TCP/IP** → Enable
4. Double-click **TCP/IP** → IP Addresses tab
5. Scroll to **IPAll** section
6. Set **TCP Port** = `1433`
7. Clear **TCP Dynamic Ports** (leave empty)
8. Click OK

### 4.2 Restart SQL Server

1. In SQL Server Configuration Manager
2. Click **SQL Server Services**
3. Right-click **SQL Server (MSSQLSERVER)**
4. Click **Restart**

### 4.3 Configure Windows Firewall

```cmd
# Run as Administrator
netsh advfirewall firewall add rule name="SQL Server" dir=in action=allow protocol=tcp localport=1433
```

Or manually:
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. Select "TCP" and enter port "1433" → Next
6. Select "Allow the connection" → Next
7. Check all profiles → Next
8. Name: "SQL Server" → Finish

### 4.4 Enable SQL Server Authentication

1. Open **SQL Server Management Studio (SSMS)**
2. Connect to your server
3. Right-click server name → Properties
4. Go to **Security** page
5. Select "SQL Server and Windows Authentication mode"
6. Click OK
7. Restart SQL Server

### 4.5 Create Login (if needed)

```sql
-- Run in SSMS
CREATE LOGIN stock_verify_user
WITH PASSWORD = 'YourSecurePassword123!';

USE YourERPDatabase;
CREATE USER stock_verify_user FOR LOGIN stock_verify_user;
EXEC sp_addrolemember 'db_datareader', 'stock_verify_user';
```

---

## Step 5: Setup Backend Server

### 5.1 Copy Backend Files

Copy the `/backend` folder from this project to your local server.

### 5.2 Create Virtual Environment

**Windows:**
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

### 5.3 Install Dependencies

```bash
pip install -r requirements.txt
```

### 5.4 Create Configuration File

```bash
cp .env.example .env
```

### 5.5 Edit Configuration

Open `.env` in a text editor:

**Windows:**
```cmd
notepad .env
```

**Linux/Mac:**
```bash
nano .env
```

Update with your settings:

```env
# SQL Server Configuration
SQL_SERVER_HOST=localhost
SQL_SERVER_PORT=1433
SQL_SERVER_DATABASE=YourERPDatabase
SQL_SERVER_USER=sa
SQL_SERVER_PASSWORD=YourPassword123
SQL_SERVER_DRIVER=ODBC Driver 17 for SQL Server

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=stock_verify

# API Settings
API_HOST=0.0.0.0
API_PORT=8001
DEBUG=true

# JWT Settings (CHANGE THIS IN PRODUCTION!)
SECRET_KEY=your-super-secret-key-change-this

# Table names in your SQL Server
ITEMS_TABLE=Items
STOCK_TABLE=Stock
```

---

## Step 6: Customize SQL Query for Your Database

Edit `backend/main.py` and find the `get_items_from_sql()` function (around line 195).

Update the SQL query to match your database schema:

```python
def get_items_from_sql() -> List[dict]:
    """Fetch items from SQL Server"""
    try:
        # CUSTOMIZE THIS QUERY FOR YOUR DATABASE
        query = f"""
            SELECT
                CAST(ItemID AS VARCHAR) as id,
                ItemCode as item_code,
                ItemName as name,
                Barcode as barcode,
                Category as category,
                SubCategory as sub_category,
                Brand as brand,
                MRP as mrp,
                SalePrice as sale_price,
                Stock as system_stock,
                UOM as uom,
                ISNULL(IsSerialized, 0) as is_serialized,
                HSNCode as hsn_code
            FROM {settings.ITEMS_TABLE}
            WHERE IsActive = 1
        """
        results = execute_query(query)
        return results
    except Exception as e:
        logger.error(f"Failed to fetch items from SQL Server: {e}")
        return []
```

### Example for Different Schemas

**Example 1: Simple Products Table**
```python
query = """
    SELECT
        CAST(ProductID AS VARCHAR) as id,
        SKU as item_code,
        ProductName as name,
        Barcode as barcode,
        CategoryName as category,
        NULL as sub_category,
        BrandName as brand,
        Price as mrp,
        Price as sale_price,
        Quantity as system_stock,
        'PCS' as uom,
        0 as is_serialized,
        NULL as hsn_code
    FROM Products
    WHERE Active = 1
"""
```

**Example 2: With Joins**
```python
query = """
    SELECT
        CAST(p.ID AS VARCHAR) as id,
        p.Code as item_code,
        p.Name as name,
        p.Barcode as barcode,
        c.Name as category,
        sc.Name as sub_category,
        b.Name as brand,
        p.MRP as mrp,
        p.SalePrice as sale_price,
        ISNULL(s.Qty, 0) as system_stock,
        p.UOM as uom,
        p.IsSerialized as is_serialized,
        p.HSN as hsn_code
    FROM Products p
    LEFT JOIN Categories c ON p.CategoryID = c.ID
    LEFT JOIN SubCategories sc ON p.SubCategoryID = sc.ID
    LEFT JOIN Brands b ON p.BrandID = b.ID
    LEFT JOIN Stock s ON p.ID = s.ProductID
    WHERE p.IsActive = 1
"""
```

---

## Step 7: Start Backend Server

### 7.1 Activate Virtual Environment

**Windows:**
```cmd
cd backend
venv\Scripts\activate
```

**Linux/Mac:**
```bash
cd backend
source venv/bin/activate
```

### 7.2 Start Server

```bash
python main.py
```

You should see:
```
INFO:     Starting Stock Verify Backend...
INFO:     MongoDB connected successfully
INFO:     SQL Server connected successfully
INFO:     Uvicorn running on http://0.0.0.0:8001
```

### 7.3 Test Server

Open browser: http://localhost:8001/health

Should return:
```json
{
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00",
    "sql_connected": true,
    "mongo_connected": true
}
```

---

## Step 8: Install and Configure ngrok

### 8.1 Download ngrok

1. Go to https://ngrok.com/download
2. Download for your OS
3. Extract the file

### 8.2 Create ngrok Account

1. Go to https://ngrok.com
2. Sign up for free account
3. Go to Dashboard → Your Authtoken
4. Copy the authtoken

### 8.3 Configure ngrok

**Windows:**
```cmd
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

**Linux/Mac:**
```bash
./ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

### 8.4 Start ngrok Tunnel

Open a **new terminal** (keep backend running):

```bash
ngrok http 8001
```

You'll see:
```
Session Status                online
Account                       your-email@example.com (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123xyz.ngrok-free.app -> http://localhost:8001
```

**Copy the HTTPS URL**: `https://abc123xyz.ngrok-free.app`

---

## Step 9: Configure Mobile App

### 9.1 Open Vibecode App

1. Open your Vibecode project
2. Click on the **ENV** tab (on the left sidebar)

### 9.2 Add Environment Variable

Click "Add Variable" and enter:

| Name | Value |
|------|-------|
| EXPO_PUBLIC_API_BASE_URL | https://abc123xyz.ngrok-free.app/api |

**Replace `abc123xyz.ngrok-free.app` with your actual ngrok URL**

### 9.3 Save and Restart

The app will automatically reload with the new configuration.

---

## Step 10: Test the Connection

### 10.1 Open Sync Settings

1. Open the app
2. Log in with demo credentials:
   - Username: `staff1`
   - Password: `1234`
3. Go to Dashboard
4. Tap the **Settings** icon (gear icon)
5. Select **Sync Settings**

### 10.2 Check Connection Status

You should see:
- **Network**: Connected (green)
- **SQL Server**: Connected (green)
- **MongoDB**: Connected (green)

### 10.3 Test Sync

1. Tap **Sync Now** button
2. Wait for sync to complete
3. Status should show "Success"

---

## Troubleshooting

### Problem: SQL Server Connection Failed

**Symptoms:**
- "SQL Server connected: false" in health check
- Connection timeout errors

**Solutions:**

1. **Check SQL Server is running:**
   ```cmd
   # Windows
   sc query MSSQLSERVER
   ```

2. **Verify TCP/IP is enabled:**
   - Open SQL Server Configuration Manager
   - Check TCP/IP protocol is enabled

3. **Test connection locally:**
   ```cmd
   sqlcmd -S localhost -U sa -P YourPassword
   ```

4. **Check firewall:**
   ```cmd
   netstat -an | findstr 1433
   ```
   Should show: `0.0.0.0:1433 ... LISTENING`

5. **Verify credentials:**
   - Try connecting with SSMS using same credentials

### Problem: MongoDB Connection Failed

**Symptoms:**
- "MongoDB connected: false" in health check

**Solutions:**

1. **Check MongoDB is running:**
   ```bash
   # Windows
   sc query MongoDB

   # Linux
   sudo systemctl status mongod
   ```

2. **Start MongoDB:**
   ```bash
   # Windows
   net start MongoDB

   # Linux
   sudo systemctl start mongod
   ```

3. **Test connection:**
   ```bash
   mongosh --eval "db.version()"
   ```

### Problem: ngrok Tunnel Not Working

**Symptoms:**
- App shows "Backend server is not reachable"
- ngrok connection refused

**Solutions:**

1. **Check backend is running:**
   - Backend must be running on port 8001

2. **Check ngrok is connected:**
   - ngrok terminal should show "online" status

3. **Verify URL:**
   - Make sure you're using the HTTPS URL (not HTTP)
   - Include `/api` at the end

4. **Free tier limitations:**
   - ngrok URL changes each restart
   - Update ENV tab with new URL

### Problem: No Items Showing

**Symptoms:**
- Sync succeeds but no items appear

**Solutions:**

1. **Check SQL query:**
   - Verify table name in `.env` matches your database
   - Test query directly in SSMS

2. **Check column mapping:**
   - Ensure column names in query match your schema

3. **View mock data:**
   - Backend uses mock data if SQL fails
   - Check logs for SQL errors

---

## Running as Service (Production)

### Windows Service

1. Install NSSM (Non-Sucking Service Manager):
   ```cmd
   choco install nssm
   ```

2. Create service:
   ```cmd
   nssm install StockVerifyBackend
   ```

3. Configure:
   - Path: `C:\path\to\backend\venv\Scripts\python.exe`
   - Startup directory: `C:\path\to\backend`
   - Arguments: `main.py`

4. Start service:
   ```cmd
   nssm start StockVerifyBackend
   ```

### Linux Systemd Service

1. Create service file:
   ```bash
   sudo nano /etc/systemd/system/stockverify.service
   ```

2. Add content:
   ```ini
   [Unit]
   Description=Stock Verify Backend
   After=network.target

   [Service]
   Type=simple
   User=your-user
   WorkingDirectory=/path/to/backend
   ExecStart=/path/to/backend/venv/bin/python main.py
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```

3. Enable and start:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable stockverify
   sudo systemctl start stockverify
   ```

---

## ngrok Paid Plans (Static URL)

Free ngrok URLs change every restart. For production:

1. **ngrok Pro** ($20/month):
   - Static subdomain
   - Custom domains
   - More connections

2. **Alternatives:**
   - **Cloudflare Tunnel** (free static URL)
   - **Tailscale** (VPN-based)
   - **Deploy backend to cloud** (Azure, AWS, etc.)

---

## Quick Reference

| Service | Port | URL |
|---------|------|-----|
| Mobile App | 8081 | Vibecode handles this |
| Backend API | 8001 | http://localhost:8001 |
| ngrok Tunnel | - | https://xxx.ngrok-free.app |
| SQL Server | 1433 | localhost,1433 |
| MongoDB | 27017 | mongodb://localhost:27017 |

| Demo User | Password | Role |
|-----------|----------|------|
| staff1 | 1234 | Staff |
| supervisor1 | 1234 | Supervisor |
| admin | admin | Admin |

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. View backend logs in terminal
3. Check ngrok web interface: http://127.0.0.1:4040
4. Test API directly: http://localhost:8001/health
