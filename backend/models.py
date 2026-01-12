"""
Pydantic models for API requests/responses
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# Enums
class UserRole(str, Enum):
    STAFF = "staff"
    SUPERVISOR = "supervisor"
    ADMIN = "admin"


class SessionStatus(str, Enum):
    ACTIVE = "active"
    PENDING_VERIFICATION = "pending_verification"
    VERIFIED = "verified"
    REJECTED = "rejected"
    COMPLETED = "completed"


class EntryStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    RECOUNT_REQUIRED = "recount_required"


class LocationType(str, Enum):
    SHOWROOM = "showroom"
    GODOWN = "godown"


class DamageCategory(str, Enum):
    TRANSIT = "transit"
    HANDLING = "handling"
    CUSTOMER_RETURN = "customer_return"
    STORAGE = "storage"
    UNKNOWN = "unknown"


# User Models
class UserBase(BaseModel):
    username: str
    name: str
    role: UserRole
    is_active: bool = True


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User


# Item Models (from SQL Server)
class ItemVariant(BaseModel):
    barcode: str
    system_stock: int
    uom: str


class Item(BaseModel):
    id: str
    item_code: str
    name: str
    barcode: str
    category: str
    sub_category: Optional[str] = None
    brand: Optional[str] = None
    mrp: float
    sale_price: float
    system_stock: int
    uom: str
    is_serialized: bool = False
    is_bundle_enabled: bool = False
    tax_classification: Optional[str] = None
    hsn_code: Optional[str] = None
    variants: Optional[List[ItemVariant]] = None


# Session Models
class SessionCreate(BaseModel):
    user_id: str
    user_name: str
    location_type: LocationType
    floor: Optional[str] = None
    area: Optional[str] = None
    rack_no: str


class Session(BaseModel):
    id: str
    user_id: str
    user_name: str
    location_type: LocationType
    floor: Optional[str] = None
    area: Optional[str] = None
    rack_no: str
    created_at: datetime
    status: SessionStatus = SessionStatus.ACTIVE
    total_scanned: int = 0
    total_verified: int = 0
    total_rejected: int = 0
    assigned_by: Optional[str] = None
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None


class SessionUpdate(BaseModel):
    status: Optional[SessionStatus] = None
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    supervisor_remarks: Optional[str] = None


# Entry Models
class BatchInfo(BaseModel):
    id: str
    batch_no: str
    mfg_date: Optional[str] = None
    expiry_date: Optional[str] = None
    quantity: int
    damage_qty: int = 0


class DamageEntry(BaseModel):
    quantity: int
    category: DamageCategory
    remarks: Optional[str] = None
    photos: Optional[List[str]] = None


class EntryCreate(BaseModel):
    session_id: str
    item_id: str
    item_code: str
    item_name: str
    item_barcode: str
    system_stock: int
    counted_qty: int
    variance: int
    variance_value: Optional[float] = None
    condition: str = "new"
    issue_details: Optional[str] = None
    mrp: float
    edited_mrp: Optional[float] = None
    mfg_date_type: str = "none"
    mfg_date: Optional[str] = None
    expiry_date_type: str = "none"
    expiry_date: Optional[str] = None
    serial_numbers: Optional[List[str]] = None
    photos: Optional[List[str]] = None
    remark: Optional[str] = None
    location_in_rack: Optional[str] = None
    batches: Optional[List[BatchInfo]] = None
    damage_qty: Optional[int] = None
    damage_entries: Optional[List[DamageEntry]] = None
    is_multi_location: bool = False


class Entry(EntryCreate):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    status: EntryStatus = EntryStatus.PENDING
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    is_synced: bool = True


class EntryUpdate(BaseModel):
    counted_qty: Optional[int] = None
    variance: Optional[int] = None
    status: Optional[EntryStatus] = None
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    recount_assigned_to: Optional[str] = None


# Sync Models
class SyncOperation(BaseModel):
    type: str  # 'session' or 'count_line'
    offline_id: str
    data: Dict[str, Any]
    timestamp: str


class BatchSyncRequest(BaseModel):
    operations: List[SyncOperation]


class SyncResult(BaseModel):
    offline_id: str
    server_id: Optional[str] = None
    success: bool
    message: Optional[str] = None


class BatchSyncResponse(BaseModel):
    results: List[SyncResult]
    total: int
    successful: int
    failed: int


class SyncStatus(BaseModel):
    last_sync: Optional[str] = None
    pending_count: int = 0
    erp_connected: bool
    mongodb_connected: bool


# Variance Report
class VarianceReport(BaseModel):
    total_items: int
    short_items: int
    over_items: int
    matched_items: int
    total_variance_value: float


# Metrics
class Metrics(BaseModel):
    total_sessions: int
    active_sessions: int
    total_items_counted: int
    accuracy_rate: float
