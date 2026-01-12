// Stock Verification App Types

export type UserRole = 'staff' | 'supervisor' | 'admin';
export type LocationType = 'showroom' | 'godown';
export type ShowroomFloor = 'ground' | 'first' | 'second';
export type GodownArea = 'main' | 'top' | 'damage';
export type ItemCondition = 'new' | 'aged' | 'issue';
export type DateEntryType = 'year_only' | 'month_year' | 'full_date' | 'none';
export type SessionStatus = 'active' | 'pending_verification' | 'verified' | 'rejected' | 'completed';
export type EntryStatus = 'pending' | 'verified' | 'rejected' | 'recount_required';
export type SerialStatus = 'active' | 'damaged' | 'missing';
export type DamageCategory = 'transit' | 'handling' | 'customer_return' | 'storage' | 'unknown';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  deviceId?: string;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  userName: string;
  locationType: LocationType;
  floor?: ShowroomFloor;
  area?: GodownArea;
  rackNo: string;
  createdAt: string;
  status: SessionStatus;
  totalScanned: number;
  totalVerified: number;
  totalRejected: number;
  assignedBy?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  supervisorRemarks?: string;
}

export interface ItemVariant {
  barcode: string;
  systemStock: number;
  uom: string;
}

export interface Item {
  id: string;
  itemCode: string;
  name: string;
  barcode: string;
  category: string;
  subCategory?: string;
  brand?: string;
  mrp: number;
  salePrice: number;
  systemStock: number;
  uom: string;
  isSerialized: boolean;
  isBundleEnabled?: boolean;
  taxClassification?: string;
  hsnCode?: string;
  lastVerifiedDate?: string;
  lastVerifiedBy?: string;
  variants?: ItemVariant[];
}

export interface SerialNumber {
  serial: string;
  status: SerialStatus;
  damageCategory?: DamageCategory;
  damageRemarks?: string;
}

// Batch information for items with multiple batches
export interface BatchInfo {
  id: string;
  batchNo: string;
  mfgDate?: string;
  expiryDate?: string;
  quantity: number;
  damageQty: number;
  damageCategory?: DamageCategory;
  damageRemarks?: string;
  photos?: string[];
}

// Damage entry for tracking damaged items
export interface DamageEntry {
  quantity: number;
  category: DamageCategory;
  remarks?: string;
  photos?: string[];
}

export interface CountedEntry {
  id: string;
  sessionId: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  itemBarcode: string;
  systemStock: number;
  countedQty: number;
  variance: number; // negative = short, 0 = match, positive = over
  varianceValue?: number; // MRP impact
  condition: ItemCondition;
  issueDetails?: string;
  mrp: number;
  editedMrp?: number;
  mfgDateType: DateEntryType;
  mfgDate?: string;
  expiryDateType: DateEntryType;
  expiryDate?: string;
  serialNumbers?: SerialNumber[];
  photos?: string[];
  remark?: string;
  bundleItems?: BundleItem[];
  // New fields for enhanced tracking
  locationInRack?: string; // Specific location within rack (shelf, bin, etc.)
  batches?: BatchInfo[]; // Multiple batches of same item
  damageQty?: number; // Total damage quantity
  damageEntries?: DamageEntry[]; // Multiple damage entries with categories
  isMultiLocation?: boolean; // Flag if item exists in multiple locations
  previousEntryId?: string; // Link to previous entry if updating
  createdAt: string;
  updatedAt?: string;
  status: EntryStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  recountAssignedTo?: string;
  recountCount?: number;
  isSynced: boolean;
}

export interface BundleItem {
  id: string;
  name: string;
  serialNumber?: string;
  photo?: string;
}

export interface DashboardStats {
  totalScanned: number;
  totalVerified: number;
  totalRacksFinished: number;
  shortItems: number;
  overItems: number;
  matchedItems: number;
  pendingVerification: number;
  rejectedItems: number;
}

export interface SupervisorStats {
  pendingSessions: number;
  verifiedToday: number;
  rejectedToday: number;
  totalVariance: number;
  staffProductivity: { userId: string; userName: string; scanned: number; accuracy: number }[];
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  activeSessions: number;
  completedSessions: number;
  totalItems: number;
  varianceValue: number;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  targetId?: string;
  details: string;
  timestamp: string;
  type?: string;
}

export interface OfflineAction {
  id: string;
  type: 'create_entry' | 'update_entry' | 'submit_session' | 'verify_entry' | 'reject_entry';
  payload: unknown;
  timestamp: string;
  isSynced: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'recount' | 'approval' | 'rejection' | 'assignment';
  isRead: boolean;
  relatedSessionId?: string;
  createdAt: string;
}
