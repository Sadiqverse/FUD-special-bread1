/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BreadCategory = 'Sourdough' | 'White Bread' | 'Rye' | 'Whole Wheat' | 'Pastry' | 'Sweet Bread' | 'Other';

export type ProductionStatus = 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';

export type PaymentMethod = 'Cash' | 'Card' | 'Mobile';

export interface Bread {
  id: string;
  name: string;
  category: BreadCategory;
  sku: string;
  price: number; // selling price
  cost: number; // production ingredient cost
  currentStock: number;
  minStock: number; // low-stock alert trigger threshold
  isActive: boolean;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

export interface Production {
  id: string;
  breadId: string;
  breadName: string; // cached name
  batchNumber: string;
  quantityPlanned: number;
  quantityProduced: number; // actual amount baked successfully
  quantityScrapped: number; // damaged/unusable products
  status: ProductionStatus;
  date: string; // YYYY-MM-DD
  bakerId: string;
  bakerEmail: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  breadId: string;
  breadName: string; // cached name
  quantitySold: number;
  pricePerUnit: number; // captured price at time of sale
  totalAmount: number; // quantity * pricePerUnit
  paymentMethod: PaymentMethod;
  date: string; // YYYY-MM-DD
  soldById: string;
  soldByEmail: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'Admin' | 'Baker' | 'Cashier';
  emailVerified: boolean;
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
