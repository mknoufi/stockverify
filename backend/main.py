"""
Stock Verify Backend - FastAPI Server
Connects to SQL Server for ERP data and MongoDB for session/count storage
"""
import logging
from datetime import datetime, timedelta
from typing import List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from passlib.context import CryptContext
import uvicorn

from config import settings
from database import (
    connect_mongodb,
    close_mongodb,
    get_mongodb,
    test_sql_connection,
    execute_query,
    is_sql_connected,
    is_mongo_connected,
)
from models import (
    User, UserCreate, UserLogin, Token,
    Item, ItemVariant,
    Session, SessionCreate, SessionUpdate,
    Entry, EntryCreate, EntryUpdate,
    BatchSyncRequest, BatchSyncResponse, SyncResult, SyncStatus,
    VarianceReport, Metrics,
    SessionStatus, EntryStatus,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    logger.info("Starting Stock Verify Backend...")

    # Connect to MongoDB
    mongo_ok = await connect_mongodb()
    if mongo_ok:
        logger.info("MongoDB connected")
    else:
        logger.warning("MongoDB connection failed - sessions will not persist")

    # Test SQL Server connection
    sql_ok = test_sql_connection()
    if sql_ok:
        logger.info("SQL Server connected")
    else:
        logger.warning("SQL Server connection failed - using mock data")

    yield

    # Shutdown
    logger.info("Shutting down...")
    await close_mongodb()


# Create FastAPI app
app = FastAPI(
    title="Stock Verify API",
    description="Backend API for Stock Verification Mobile App",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============== MOCK DATA (used when SQL Server not available) ==============
MOCK_ITEMS = [
    {
        "id": "1",
        "item_code": "SAM-S24U-001",
        "name": "Samsung Galaxy S24 Ultra",
        "barcode": "5101234567890",
        "category": "Electronics",
        "sub_category": "Mobile Phones",
        "brand": "Samsung",
        "mrp": 134999,
        "sale_price": 129999,
        "system_stock": 15,
        "uom": "PCS",
        "is_serialized": True,
        "hsn_code": "8517",
    },
    {
        "id": "2",
        "item_code": "APL-IP15PM-001",
        "name": "Apple iPhone 15 Pro Max",
        "barcode": "5201234567890",
        "category": "Electronics",
        "sub_category": "Mobile Phones",
        "brand": "Apple",
        "mrp": 159900,
        "sale_price": 154900,
        "system_stock": 12,
        "uom": "PCS",
        "is_serialized": True,
        "hsn_code": "8517",
    },
    {
        "id": "3",
        "item_code": "SNY-WH1000-001",
        "name": "Sony WH-1000XM5 Headphones",
        "barcode": "5301234567890",
        "category": "Electronics",
        "sub_category": "Audio",
        "brand": "Sony",
        "mrp": 29990,
        "sale_price": 26990,
        "system_stock": 25,
        "uom": "PCS",
        "is_serialized": True,
        "hsn_code": "8518",
    },
]

MOCK_USERS = [
    {"id": "1", "username": "staff1", "name": "Rahul Kumar", "role": "staff", "is_active": True, "password_hash": pwd_context.hash("1234")},
    {"id": "2", "username": "supervisor1", "name": "Amit Patel", "role": "supervisor", "is_active": True, "password_hash": pwd_context.hash("1234")},
    {"id": "3", "username": "admin", "name": "Admin User", "role": "admin", "is_active": True, "password_hash": pwd_context.hash("admin")},
]


# ============== HELPER FUNCTIONS ==============

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def get_items_from_sql() -> List[dict]:
    """Fetch items from SQL Server"""
    try:
        # Customize this query based on your SQL Server schema
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


def get_stock_from_sql(item_ids: Optional[List[str]] = None) -> dict:
    """Fetch stock levels from SQL Server"""
    try:
        if item_ids:
            ids_str = ",".join([f"'{id}'" for id in item_ids])
            query = f"SELECT ItemID, Stock FROM {settings.STOCK_TABLE} WHERE ItemID IN ({ids_str})"
        else:
            query = f"SELECT ItemID, Stock FROM {settings.STOCK_TABLE}"
        results = execute_query(query)
        return {str(r["ItemID"]): r["Stock"] for r in results}
    except Exception as e:
        logger.error(f"Failed to fetch stock from SQL Server: {e}")
        return {}


# ============== API ROUTES ==============

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "sql_connected": is_sql_connected(),
        "mongo_connected": is_mongo_connected(),
    }


@app.get("/api/health")
async def api_health_check():
    """API health check endpoint"""
    return await health_check()


# ------------ AUTH ------------

@app.post("/api/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    """User login"""
    # Check mock users first
    user_data = None
    for u in MOCK_USERS:
        if u["username"] == credentials.username:
            if pwd_context.verify(credentials.password, u["password_hash"]):
                user_data = u
                break

    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": user_data["username"]})

    user = User(
        id=user_data["id"],
        username=user_data["username"],
        name=user_data["name"],
        role=user_data["role"],
        is_active=user_data["is_active"],
        created_at=datetime.utcnow(),
    )

    return Token(access_token=access_token, user=user)


# ------------ ERP ITEMS (SQL Server) ------------

@app.get("/api/erp/items", response_model=List[Item])
async def get_items(
    search: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = Query(default=100, le=1000),
    offset: int = 0,
):
    """Get items from ERP (SQL Server)"""
    # Try SQL Server first
    if is_sql_connected():
        items = get_items_from_sql()
    else:
        items = MOCK_ITEMS

    # Apply filters
    if search:
        search_lower = search.lower()
        items = [i for i in items if search_lower in i.get("name", "").lower() or search_lower in i.get("barcode", "")]

    if category:
        items = [i for i in items if i.get("category", "").lower() == category.lower()]

    # Apply pagination
    items = items[offset:offset + limit]

    return items


@app.get("/api/erp/items/barcode/{barcode}", response_model=Item)
async def get_item_by_barcode(barcode: str):
    """Get item by barcode"""
    if is_sql_connected():
        items = get_items_from_sql()
    else:
        items = MOCK_ITEMS

    for item in items:
        if item.get("barcode") == barcode:
            return item

    raise HTTPException(status_code=404, detail="Item not found")


@app.get("/api/erp/items/{item_id}", response_model=Item)
async def get_item_by_id(item_id: str):
    """Get item by ID"""
    if is_sql_connected():
        items = get_items_from_sql()
    else:
        items = MOCK_ITEMS

    for item in items:
        if str(item.get("id")) == item_id:
            return item

    raise HTTPException(status_code=404, detail="Item not found")


@app.get("/api/erp/stock")
async def get_stock_levels():
    """Get all stock levels"""
    if is_sql_connected():
        return get_stock_from_sql()
    else:
        return {item["id"]: item["system_stock"] for item in MOCK_ITEMS}


@app.post("/api/erp/stock")
async def get_stock_levels_for_items(data: dict):
    """Get stock levels for specific items"""
    item_ids = data.get("item_ids", [])
    if is_sql_connected():
        return get_stock_from_sql(item_ids)
    else:
        return {item["id"]: item["system_stock"] for item in MOCK_ITEMS if item["id"] in item_ids}


# ------------ SESSIONS (MongoDB) ------------

@app.get("/api/sessions", response_model=List[Session])
async def get_sessions(
    status: Optional[str] = None,
    user_id: Optional[str] = None,
):
    """Get sessions"""
    db = get_mongodb()
    if not db:
        return []

    query = {}
    if status:
        query["status"] = status
    if user_id:
        query["user_id"] = user_id

    sessions = await db.sessions.find(query).sort("created_at", -1).to_list(100)

    # Convert MongoDB _id to id
    for s in sessions:
        s["id"] = str(s.pop("_id"))

    return sessions


@app.post("/api/sessions", response_model=Session)
async def create_session(session_data: SessionCreate):
    """Create a new session"""
    db = get_mongodb()
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    session_dict = session_data.model_dump()
    session_dict["created_at"] = datetime.utcnow()
    session_dict["status"] = SessionStatus.ACTIVE
    session_dict["total_scanned"] = 0
    session_dict["total_verified"] = 0
    session_dict["total_rejected"] = 0

    result = await db.sessions.insert_one(session_dict)
    session_dict["id"] = str(result.inserted_id)

    return session_dict


@app.get("/api/sessions/{session_id}", response_model=Session)
async def get_session(session_id: str):
    """Get session by ID"""
    db = get_mongodb()
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    from bson import ObjectId
    session = await db.sessions.find_one({"_id": ObjectId(session_id)})

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session["id"] = str(session.pop("_id"))
    return session


@app.patch("/api/sessions/{session_id}", response_model=Session)
async def update_session(session_id: str, updates: SessionUpdate):
    """Update session"""
    db = get_mongodb()
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    from bson import ObjectId
    update_dict = {k: v for k, v in updates.model_dump().items() if v is not None}

    result = await db.sessions.update_one(
        {"_id": ObjectId(session_id)},
        {"$set": update_dict}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")

    session = await db.sessions.find_one({"_id": ObjectId(session_id)})
    session["id"] = str(session.pop("_id"))
    return session


# ------------ ENTRIES (MongoDB) ------------

@app.get("/api/sessions/{session_id}/entries", response_model=List[Entry])
async def get_entries(session_id: str):
    """Get entries for a session"""
    db = get_mongodb()
    if not db:
        return []

    entries = await db.entries.find({"session_id": session_id}).sort("created_at", -1).to_list(1000)

    for e in entries:
        e["id"] = str(e.pop("_id"))

    return entries


@app.post("/api/entries", response_model=Entry)
async def create_entry(entry_data: EntryCreate):
    """Create a new entry"""
    db = get_mongodb()
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    entry_dict = entry_data.model_dump()
    entry_dict["created_at"] = datetime.utcnow()
    entry_dict["status"] = EntryStatus.PENDING
    entry_dict["is_synced"] = True

    result = await db.entries.insert_one(entry_dict)
    entry_dict["id"] = str(result.inserted_id)

    # Update session counts
    await db.sessions.update_one(
        {"_id": entry_data.session_id},
        {"$inc": {"total_scanned": 1}}
    )

    return entry_dict


@app.patch("/api/entries/{entry_id}", response_model=Entry)
async def update_entry(entry_id: str, updates: EntryUpdate):
    """Update entry"""
    db = get_mongodb()
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    from bson import ObjectId
    update_dict = {k: v for k, v in updates.model_dump().items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()

    result = await db.entries.update_one(
        {"_id": ObjectId(entry_id)},
        {"$set": update_dict}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Entry not found")

    entry = await db.entries.find_one({"_id": ObjectId(entry_id)})
    entry["id"] = str(entry.pop("_id"))
    return entry


# ------------ SYNC ------------

@app.post("/api/sync/batch", response_model=BatchSyncResponse)
async def batch_sync(request: BatchSyncRequest):
    """Batch sync offline data"""
    db = get_mongodb()
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    results = []
    successful = 0
    failed = 0

    for op in request.operations:
        try:
            if op.type == "session":
                # Create session
                session_data = op.data
                session_data["created_at"] = datetime.fromisoformat(op.timestamp.replace("Z", "+00:00"))
                result = await db.sessions.insert_one(session_data)
                results.append(SyncResult(
                    offline_id=op.offline_id,
                    server_id=str(result.inserted_id),
                    success=True,
                ))
                successful += 1
            elif op.type == "count_line":
                # Create entry
                entry_data = op.data
                entry_data["created_at"] = datetime.fromisoformat(op.timestamp.replace("Z", "+00:00"))
                entry_data["is_synced"] = True
                result = await db.entries.insert_one(entry_data)
                results.append(SyncResult(
                    offline_id=op.offline_id,
                    server_id=str(result.inserted_id),
                    success=True,
                ))
                successful += 1
            else:
                results.append(SyncResult(
                    offline_id=op.offline_id,
                    success=False,
                    message=f"Unknown operation type: {op.type}",
                ))
                failed += 1
        except Exception as e:
            results.append(SyncResult(
                offline_id=op.offline_id,
                success=False,
                message=str(e),
            ))
            failed += 1

    return BatchSyncResponse(
        results=results,
        total=len(request.operations),
        successful=successful,
        failed=failed,
    )


@app.get("/api/sync/status", response_model=SyncStatus)
async def get_sync_status():
    """Get sync and connection status"""
    return SyncStatus(
        last_sync=datetime.utcnow().isoformat(),
        pending_count=0,
        erp_connected=is_sql_connected(),
        mongodb_connected=is_mongo_connected(),
    )


# ------------ USERS ------------

@app.get("/api/users", response_model=List[User])
async def get_users():
    """Get all users"""
    users = []
    for u in MOCK_USERS:
        users.append(User(
            id=u["id"],
            username=u["username"],
            name=u["name"],
            role=u["role"],
            is_active=u["is_active"],
            created_at=datetime.utcnow(),
        ))
    return users


@app.post("/api/users", response_model=User)
async def create_user(user_data: UserCreate):
    """Create a new user"""
    new_user = {
        "id": str(len(MOCK_USERS) + 1),
        "username": user_data.username,
        "name": user_data.name,
        "role": user_data.role,
        "is_active": user_data.is_active,
        "password_hash": pwd_context.hash(user_data.password),
    }
    MOCK_USERS.append(new_user)

    return User(
        id=new_user["id"],
        username=new_user["username"],
        name=new_user["name"],
        role=new_user["role"],
        is_active=new_user["is_active"],
        created_at=datetime.utcnow(),
    )


# ------------ VARIANCE REPORTS ------------

@app.get("/api/variance/report", response_model=VarianceReport)
async def get_variance_report(session_id: Optional[str] = None):
    """Get variance report"""
    db = get_mongodb()
    if not db:
        return VarianceReport(
            total_items=0,
            short_items=0,
            over_items=0,
            matched_items=0,
            total_variance_value=0,
        )

    query = {}
    if session_id:
        query["session_id"] = session_id

    entries = await db.entries.find(query).to_list(10000)

    total = len(entries)
    short = len([e for e in entries if e.get("variance", 0) < 0])
    over = len([e for e in entries if e.get("variance", 0) > 0])
    matched = len([e for e in entries if e.get("variance", 0) == 0])
    variance_value = sum(e.get("variance_value", 0) or 0 for e in entries)

    return VarianceReport(
        total_items=total,
        short_items=short,
        over_items=over,
        matched_items=matched,
        total_variance_value=variance_value,
    )


# ------------ METRICS ------------

@app.get("/api/metrics", response_model=Metrics)
async def get_metrics():
    """Get system metrics"""
    db = get_mongodb()
    if not db:
        return Metrics(
            total_sessions=0,
            active_sessions=0,
            total_items_counted=0,
            accuracy_rate=0,
        )

    total_sessions = await db.sessions.count_documents({})
    active_sessions = await db.sessions.count_documents({"status": "active"})
    total_entries = await db.entries.count_documents({})
    matched_entries = await db.entries.count_documents({"variance": 0})

    accuracy = (matched_entries / total_entries * 100) if total_entries > 0 else 0

    return Metrics(
        total_sessions=total_sessions,
        active_sessions=active_sessions,
        total_items_counted=total_entries,
        accuracy_rate=round(accuracy, 2),
    )


# ------------ ACTIVITY LOGS ------------

@app.get("/api/logs/activity")
async def get_activity_logs(
    user_id: Optional[str] = None,
    action: Optional[str] = None,
    limit: int = 50,
):
    """Get activity logs"""
    # Return mock logs for now
    return []


# ------------ RACKS ------------

@app.get("/api/racks")
async def get_racks(location: Optional[str] = None):
    """Get racks"""
    racks = [
        {"id": "1", "name": "R001", "location": "showroom"},
        {"id": "2", "name": "R002", "location": "showroom"},
        {"id": "3", "name": "R003", "location": "godown"},
    ]
    if location:
        racks = [r for r in racks if r["location"] == location]
    return racks


# ============== MAIN ==============

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG,
    )
