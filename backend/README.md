# Stock Verify Backend

FastAPI backend for the Stock Verify mobile app. Connects to SQL Server for ERP data and MongoDB for session/count storage.

## Quick Start

### Windows
```batch
# Run setup
setup.bat

# Activate virtual environment
venv\Scripts\activate

# Edit .env with your SQL Server credentials
notepad .env

# Start server
python main.py
```

### Linux/Mac
```bash
# Make setup script executable
chmod +x setup.sh

# Run setup
./setup.sh

# Activate virtual environment
source venv/bin/activate

# Edit .env with your SQL Server credentials
nano .env

# Start server
python main.py
```

## Configuration

Edit `.env` file with your settings:

```env
# SQL Server Configuration
SQL_SERVER_HOST=localhost          # Your SQL Server IP/hostname
SQL_SERVER_PORT=1433               # SQL Server port
SQL_SERVER_DATABASE=YourERPDatabase # Your database name
SQL_SERVER_USER=sa                 # SQL Server username
SQL_SERVER_PASSWORD=YourPassword123 # SQL Server password

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=stock_verify

# Table names (customize based on your ERP schema)
ITEMS_TABLE=Items                  # Your items table name
STOCK_TABLE=Stock                  # Your stock table name
```

## Customize SQL Queries

Edit `main.py` and update the `get_items_from_sql()` function to match your SQL Server schema:

```python
def get_items_from_sql() -> List[dict]:
    query = f"""
        SELECT
            CAST(YourItemID AS VARCHAR) as id,
            YourItemCode as item_code,
            YourItemName as name,
            YourBarcode as barcode,
            YourCategory as category,
            YourMRP as mrp,
            YourStock as system_stock,
            YourUOM as uom
        FROM {settings.ITEMS_TABLE}
        WHERE IsActive = 1
    """
    results = execute_query(query)
    return results
```

## Expose with ngrok (for cloud app access)

1. Install ngrok: https://ngrok.com/download

2. Authenticate:
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

3. Start tunnel:
```bash
ngrok http 8001
```

4. Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

5. In Vibecode app, go to **ENV tab** and set:
```
EXPO_PUBLIC_API_BASE_URL=https://abc123.ngrok-free.app/api
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/erp/items` | GET | Get items from SQL Server |
| `/api/erp/items/barcode/{code}` | GET | Get item by barcode |
| `/api/erp/stock` | GET | Get stock levels |
| `/api/sessions` | GET/POST | List/create sessions |
| `/api/sessions/{id}` | GET/PATCH | Get/update session |
| `/api/entries` | POST | Create entry |
| `/api/entries/{id}` | PATCH | Update entry |
| `/api/sync/batch` | POST | Batch sync offline data |
| `/api/sync/status` | GET | Connection status |
| `/api/users` | GET/POST | User management |
| `/api/variance/report` | GET | Variance reports |

## Test the API

```bash
# Health check
curl http://localhost:8001/health

# Get items
curl http://localhost:8001/api/erp/items

# Get sync status
curl http://localhost:8001/api/sync/status
```

## Troubleshooting

### SQL Server Connection Failed
1. Check SQL Server is running
2. Enable TCP/IP in SQL Server Configuration Manager
3. Check firewall allows port 1433
4. Verify credentials in `.env`

### MongoDB Connection Failed
1. Install MongoDB: https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Check port 27017 is available

### ODBC Driver Missing
- Windows: Download from Microsoft
- Ubuntu: `sudo apt install unixodbc-dev`
- Mac: `brew install unixodbc freetds`
