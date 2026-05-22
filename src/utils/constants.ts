/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BreadCategory, ProductionStatus, PaymentMethod } from './types';

export const BREAD_CATEGORIES: BreadCategory[] = [
  'Sourdough',
  'White Bread',
  'Rye',
  'Whole Wheat',
  'Pastry',
  'Sweet Bread',
  'Other'
];

export const PRODUCTION_STATUSES: ProductionStatus[] = [
  'Planned',
  'In Progress',
  'Completed',
  'Cancelled'
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'Card',
  'Mobile'
];

export const ROLE_OPTIONS = ['Admin', 'Baker', 'Cashier'] as const;

export const DEFAULT_BREAD_FORM = {
  name: '',
  category: 'Sourdough' as BreadCategory,
  sku: '',
  price: 0,
  cost: 0,
  currentStock: 0,
  minStock: 10,
  isActive: true,
};

export const DEFAULT_PRODUCTION_FORM = {
  breadId: '',
  batchNumber: '',
  quantityPlanned: 0,
  quantityProduced: 0,
  quantityScrapped: 0,
  status: 'Planned' as ProductionStatus,
  date: new Date().toISOString().split('T')[0],
  notes: '',
};

export const DEFAULT_SALES_FORM = {
  breadId: '',
  quantitySold: 1,
  paymentMethod: 'Cash' as PaymentMethod,
  date: new Date().toISOString().split('T')[0],
  notes: '',
};
