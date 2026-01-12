// Stock Verification App Types

export type LocationType = 'showroom' | 'godown';
export type ShowroomFloor = 'ground' | 'first' | 'second';
export type GodownArea = 'main' | 'top' | 'damage';
export type ItemCondition = 'new' | 'aged' | 'issue';
export type DateEntryType = 'year_only' | 'month_year' | 'full_date' | 'none';

export interface User {
  id: string;
  username: string;
  name: string;
}

export interface Session {
  id: string;
  userId: string;
  locationType: LocationType;
  floor?: ShowroomFloor;
  area?: GodownArea;
  rackNo: string;
  createdAt: string;
  status: 'active' | 'completed';
  totalScanned: number;
  totalVerified: number;
}

export interface ItemVariant {
  barcode: string;
  systemStock: number;
  uom: string;
}

export interface Item {
  id: string;
  name: string;
  barcode: string;
  mrp: number;
  salePrice: number;
  systemStock: number;
  uom: string;
  isSerialized: boolean;
  isBundleEnabled?: boolean;
  variants?: ItemVariant[]; // Same item name with different barcodes
}

export interface CountedEntry {
  id: string;
  sessionId: string;
  itemId: string;
  itemBarcode: string;
  countedQty: number;
  variance: number; // negative = short, 0 = match, positive = over
  condition: ItemCondition;
  issueDetails?: string;
  mrp: number;
  editedMrp?: number;
  mfgDateType: DateEntryType;
  mfgDate?: string;
  expiryDateType: DateEntryType;
  expiryDate?: string;
  serialNumbers?: string[];
  photos?: string[];
  remark?: string;
  bundleItems?: BundleItem[];
  createdAt: string;
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
}
