// Utility type for MongoDB ObjectId
type ObjectId = string;

// Commission
interface Commission {
  partnerId: ObjectId;
  slabs: {
    '0-30': number;
    '30-70': number;
    '70-100': number;
  };
}

// Inventory
interface Inventory {
  quantity: number;
  distributed: number;
  lastUpdated: Date;
  unitPrice: number;
  partnerId: ObjectId;
  status: 'available' | 'allocated' | 'distributed';
  createdAt: Date;
  updatedAt: Date;
  partner?: User; 
}

// KitDistribution
interface KitDistribution {
  partnerId: ObjectId;
  quantity: number;
  amountPerKit: number;
  totalAmount: number;
  distributionDate: Date;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  partner?: User; // Virtual
}

// KitRequest
interface KitRequest {
  partnerId: ObjectId;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected';
  date: Date;
}

// Lead
interface Lead {
  name: string;
  mobileNo: string;
  email: string;
  city: string;
  platform: 'Facebook' | 'Instagram' | 'Twitter' | 'LinkedIn' | 'YouTube';
  status: 'new' | 'contacted' | 'successful' | 'lost';
  assignedTo?: ObjectId;
  createdAt: Date;
}

// SaleData (for ManagedCommission)
interface SaleData {
  saleId: ObjectId;
  firstMonthSubscription: 'yes' | 'no';
  amountChargedFirstMonth?: number;
  renewalSecondMonth: 'yes' | 'no';
  amountChargedSecondMonth?: number;
  commission: number;
}

// ManagedCommission
interface ManagedCommission {
  partnerId: ObjectId;
  currentSlab: '0-30' | '30-70' | '70-100';
  salesData: SaleData[];
  totalCommission: number;
}

// PartnerDistribution
interface PartnerDistribution {
  partnerId: ObjectId;
  totalKits: number;
  lastDistribution: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Sale
interface Sale {
  leadId: ObjectId;
  quantity: number;
  amount?: number;
  partnerId: ObjectId;
  status: 'pending' | 'completed' | 'cancelled';
  firstMonthSubscription: 'yes' | 'no';
  renewalSecondMonth: 'yes' | 'no';
  amountChargedFirstMonth?: number;
  amountChargedSecondMonth?: number;
  createdAt: Date;
}

// SupportTicket
interface SupportTicket {
  partnerId: ObjectId;
  subject: string;
  message: string;
  status: 'open' | 'closed';
  createdAt: Date;
  reply?: string;
}

// User
interface User {
  id: ObjectId;
  name?: string;
  email: string;
  password?: string;
  role: 'admin' | 'partner';
  isProfileComplete: boolean;
  googleId?: string;
  emailVerified?: Date;
  createdAt: Date;
  city?: string;
  state?: string;
  pincode?: number;
  phoneNumber?: string;
}

export type {
  ObjectId,
  Commission,
  Inventory,
  KitDistribution,
  KitRequest,
  Lead,
  ManagedCommission,
  PartnerDistribution,
  Sale,
  SupportTicket,
  User
};