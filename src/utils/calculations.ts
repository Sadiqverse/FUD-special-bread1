/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Bread, Production, Sale } from './types';

/**
 * Calculates the gross profit margin of a bread product
 */
export function calculateProfitMargin(price: number, cost: number): number {
  if (price <= 0) return 0;
  return ((price - cost) / price) * 100;
}

/**
 * Calculates total waste / scrap rate percentage for a production run
 */
export function calculateScrapRate(quantityProduced: number, quantityScrapped: number): number {
  const total = quantityProduced + quantityScrapped;
  if (total <= 0) return 0;
  return (quantityScrapped / total) * 100;
}

/**
 * Computes financial metrics for a set of sales and production batches
 */
export interface FinancialSummary {
  totalRevenue: number;
  totalCostOfSales: number;
  grossProfit: number;
  totalScrapped: number;
  totalScrappedLoss: number;
  netProfit: number;
}

export function computeFinancials(
  sales: Sale[],
  production: Production[],
  breads: Bread[]
): FinancialSummary {
  // 1. Calculate Revenue from sales
  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);

  // 2. Map breads for quick cost lookup
  const breadCostMap: { [id: string]: number } = {};
  breads.forEach((b) => {
    breadCostMap[b.id] = b.cost;
  });

  // Calculate COGS (Cost of Goods Sold)
  // For each sale, COGS = quantitySold * ingredient cost of that bread
  const totalCostOfSales = sales.reduce((sum, s) => {
    const cost = breadCostMap[s.breadId] || 0;
    return sum + s.quantitySold * cost;
  }, 0);

  // Gross profit on items sold
  const grossProfit = totalRevenue - totalCostOfSales;

  // 3. Loss from scrapped/damaged production items
  // Total scrapped items * cost of the bread
  const totalScrapped = production.reduce((sum, p) => sum + p.quantityScrapped, 0);
  const totalScrappedLoss = production.reduce((sum, p) => {
    const cost = breadCostMap[p.breadId] || 0;
    return sum + p.quantityScrapped * cost;
  }, 0);

  // Net Profit: Gross sales profit minus waste write-off
  const netProfit = grossProfit - totalScrappedLoss;

  return {
    totalRevenue,
    totalCostOfSales,
    grossProfit,
    totalScrapped,
    totalScrappedLoss,
    netProfit,
  };
}

/**
 * Detects low stock items
 */
export function isLowStock(bread: Bread): boolean {
  return bread.isActive && bread.currentStock <= bread.minStock;
}
