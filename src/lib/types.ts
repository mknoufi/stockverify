// Stock Verification App Types

export type LocationType = 'showroom' | 'godown';
export type ShowroomFloor = 'ground' | 'first' | 'second';
export type GodownArea = 'main' | 'top' | 'damage';
export type ItemCondition = 'new' | 'aged' | 'issue';
export type DateEntryType = 'year_only' | 'month_year' | 'full_date' | 'none';
export type UserRole = 'staff' | 'supervisor' | 'admin';
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'recount';
export type SerialStatus = 'active' | 'damaged' | 'missing';
export type DamageCategory = 'transit' | 'handling' | 'customer_return' | 'storage' | 'unknown';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  pin?: string;
  isActive: boolean;
  assignedScope?: {
    floors?: ShowroomFloor[];
    areas?: GodownArea[];
    racks?: string[];
  };
  deviceId?: string; // For single active device enforcement
  lastLoginAt?: string;
}

export interface Session {
  id: string;
  userId: string;
  locationType: LocationType;
  floor?: ShowroomFloor;
  area?: GodownArea;
  rackNo: string;
  createdAt: string;
  status: 'active' | 'submitted' | 'completed' | 'recount';
  submittedAt?: string;
  totalScanned: number;
  totalVerified: number;
  verificationStatus?: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  recountAssignedTo?: string;
  recountRequestedAt?: string;
}

export interface ItemVariant {
  barcode: string;
  systemStock: number;
  uom: string;
}

export interface Item {
  id: string;
  name: string;
  itemCode: string; // Internal item code (excluded from public search)
  barcode: string;
  serialBarcode?: string; // Serial barcode if applicable
  category?: string;
  subCategory?: string;
  brand?: string;
  mrp: number;
  salePrice: number;
  systemStock: number;
  uom: string;
  isSerialized: boolean;
  isBundleEnabled?: boolean;
  variants?: ItemVariant[]; // Same item name with different barcodes
  taxClassification?: {
    gstPercent?: number;
    hsn?: string;
  };
  costPrice?: number; // For variance value calculation (Admin view)
  lastVerifiedDate?: string;
  lastVerifiedBy?: string;
}

export interface SerialNumberEntry {
  serialNumber: string;
  status: SerialStatus;
  damageCategory?: DamageCategory;
  damageRemarks?: string;
}

export interface CountedEntry {
  id: string;
  sessionId: string;
  itemId: string;
  itemBarcode: string;
  countedQty: number;
  variance: number; // negative = short, 0 = match, positive = over
  varianceValue?: number; // MRP & Cost impact (Admin view)
  condition: ItemCondition;
  issueDetails?: string;
  mrp: number;
  editedMrp?: number;
  mfgDateType: DateEntryType;
  mfgDate?: string;
  expiryDateType: DateEntryType;
  expiryDate?: string;
  serialNumbers?: SerialNumberEntry[]; // Enhanced with status and damage info
  photos?: string[];
  remark?: string;
  bundleItems?: BundleItem[];
  location?: string; // Location/rack details
  createdAt: string;
  // Verification fields
  verificationStatus: VerificationStatus;
  submittedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  supervisorRemarks?: string;
  isRecount?: boolean;
  originalEntryId?: string; // Link to original entry if this is a re-count
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
  pendingVerifications?: number; // For Supervisor/Admin
  activeSessions?: number; // For Supervisor/Admin
}

export interface VerificationEntry {
  entry: CountedEntry;
  session: Session;
  item: Item;
  staffName: string;
}

// Additional types for entry form
export interface SerialEntry {
  id: string;
  serialNumber: string;
  status: SerialStatus;
  condition?: ItemCondition;
  damageCategory?: DamageCategory;
  damageRemarks?: string;
}

export interface DamageEntry {
  category: DamageCategory;
  description: string;
  quantity?: number;
  remarks?: string;
  photos?: string[];
}

export interface BatchInfo {
  id: string;
  batchNumber?: string;
  batchNo?: string;
  mfgDate?: string;
  expiryDate?: string;
  quantity: number;
  damageQty?: number;
}

export interface BoxCount {
  id: string;
  boxNumber?: string;
  boxNo?: string;
  countInBox?: number;
  quantityInBox?: number;
  isPartial?: boolean;
  remarks?: string;
}

export interface WeightEntry {
  id: string;
  weight: number;
  unit: 'kg' | 'g' | 'lb';
  remarks?: string;
  timestamp: string;
}
