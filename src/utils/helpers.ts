/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Formats a number as USD currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Formats an ISO string or YYYY-MM-DD date into a reader-friendly format
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const dateStrClean = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const [year, month, day] = dateStrClean.split('-');
  if (!year || !month || !day) return dateStr;
  
  const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Generates a clean auto-hashed SKU for bread
 */
export function generateSKU(breadName: string, category: string): string {
  const prefix = (category.substring(0, 3) || 'BRD').toUpperCase();
  const namePart = breadName.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'XYZ';
  const randNum = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${namePart}-${randNum}`;
}

/**
 * Generates a production batch number based on current date
 */
export function generateBatchNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().substring(2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const rand = Math.floor(10 + Math.random() * 90);
  return `BATCH-${year}${month}${day}-${rand}`;
}

/**
 * Capitalizes string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
