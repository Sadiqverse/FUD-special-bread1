/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ValidationError {
  field: string;
  message: string;
}

export function validateBread(data: {
  name: string;
  sku: string;
  price: number;
  cost: number;
  currentStock: number;
  minStock: number;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.name.trim()) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (data.name.length > 100) {
    errors.push({ field: 'name', message: 'Name is too long (max 100 chars)' });
  }

  if (data.price < 0) {
    errors.push({ field: 'price', message: 'Price cannot be negative' });
  }

  if (data.cost < 0) {
    errors.push({ field: 'cost', message: 'Cost cannot be negative' });
  }

  if (data.price < data.cost) {
    errors.push({ field: 'price', message: 'Price should usually be greater than production cost' });
  }

  if (data.currentStock < 0) {
    errors.push({ field: 'currentStock', message: 'Current stock cannot be negative' });
  }

  if (data.minStock < 0) {
    errors.push({ field: 'minStock', message: 'Alert threshold cannot be negative' });
  }

  return errors;
}

export function validateProduction(data: {
  breadId: string;
  batchNumber: string;
  quantityPlanned: number;
  quantityProduced: number;
  quantityScrapped: number;
  date: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.breadId) {
    errors.push({ field: 'breadId', message: 'Please select a bread product' });
  }

  if (!data.batchNumber.trim()) {
    errors.push({ field: 'batchNumber', message: 'Batch number is required' });
  }

  if (data.quantityPlanned <= 0) {
    errors.push({ field: 'quantityPlanned', message: 'Planned quantity must be greater than 0' });
  }

  if (data.quantityProduced < 0) {
    errors.push({ field: 'quantityProduced', message: 'Produced quantity cannot be negative' });
  }

  if (data.quantityScrapped < 0) {
    errors.push({ field: 'quantityScrapped', message: 'Scrapped quantity cannot be negative' });
  }

  if (!data.date) {
    errors.push({ field: 'date', message: 'Production date is required' });
  }

  return errors;
}

export function validateSale(data: {
  breadId: string;
  quantitySold: number;
  date: string;
  currentStock: number;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.breadId) {
    errors.push({ field: 'breadId', message: 'Please select a bread product' });
  }

  if (data.quantitySold <= 0) {
    errors.push({ field: 'quantitySold', message: 'Quantity sold must be at least 1' });
  } else if (data.quantitySold > data.currentStock) {
    errors.push({ 
      field: 'quantitySold', 
      message: `Insufficient stock! Currently only ${data.currentStock} in stock.` 
    });
  }

  if (!data.date) {
    errors.push({ field: 'date', message: 'Sale date is required' });
  }

  return errors;
}
