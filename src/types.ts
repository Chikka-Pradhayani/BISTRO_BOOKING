export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  createdAt: any; // Firestore Timestamp or Date
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  isActive: boolean;
}

export interface Reservation {
  id: string;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  tableId: string;
  tableNumber: number;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}
