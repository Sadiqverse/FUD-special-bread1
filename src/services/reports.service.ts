/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Bread, Production, Sale } from '../utils/types';
import { computeFinancials } from '../utils/calculations';

export interface DailySalesData {
  date: string;
  revenue: number;
  quantity: number;
}

export interface BreadRankingData {
  breadName: string;
  category: string;
  revenue: number;
  quantity: number;
  margin: number;
}

export interface CategorySummaryData {
  category: string;
  revenue: number;
  unitsSold: number;
  unitsProduced: number;
  unitsScrapped: number;
  wasteLoss: number;
}

export const ReportsService = {
  /**
   * Chronological daily rollups for the sales chart
   */
  getDailySalesTrend(sales: Sale[], limitDays: number = 7): DailySalesData[] {
    const grouped: { [date: string]: { revenue: number; quantity: number } } = {};
    
    // Aggregate
    sales.forEach((s) => {
      const date = s.date;
      if (!grouped[date]) {
        grouped[date] = { revenue: 0, quantity: 0 };
      }
      grouped[date].revenue += s.totalAmount;
      grouped[date].quantity += s.quantitySold;
    });

    // Translate to sorted array
    const sortedData = Object.keys(grouped)
      .map((date) => ({
        date,
        revenue: grouped[date].revenue,
        quantity: grouped[date].quantity,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Limit to latest N days
    return sortedData.slice(-limitDays);
  },

  /**
   * Product rankings sorted by sales performance
   */
  getPopularBreads(sales: Sale[], breads: Bread[]): BreadRankingData[] {
    const groupedSales: { [breadId: string]: { quantity: number; revenue: number } } = {};
    
    // Accumulate sales
    sales.forEach((s) => {
      if (!groupedSales[s.breadId]) {
        groupedSales[s.breadId] = { quantity: 0, revenue: 0 };
      }
      groupedSales[s.breadId].quantity += s.quantitySold;
      groupedSales[s.breadId].revenue += s.totalAmount;
    });

    // Join with catalog meta
    const rankings = breads.map((b) => {
      const sold = groupedSales[b.id] || { quantity: 0, revenue: 0 };
      const profitMargin = b.price > 0 ? ((b.price - b.cost) / b.price) * 100 : 0;
      return {
        breadName: b.name,
        category: b.category,
        revenue: sold.revenue,
        quantity: sold.quantity,
        margin: parseFloat(profitMargin.toFixed(1)),
      };
    });

    // Sort by revenue descending
    return rankings.sort((a, b) => b.revenue - a.revenue);
  },

  /**
   * Collates total baking waste, output and sales receipts grouped by product category
   */
  getCategoryReport(
    breads: Bread[],
    production: Production[],
    sales: Sale[]
  ): CategorySummaryData[] {
    const totals: { [category: string]: CategorySummaryData } = {};

    // Get product ID -> Category map
    const productCategoryMap: { [id: string]: string } = {};
    const productCostMap: { [id: string]: number } = {};
    
    breads.forEach((b) => {
      productCategoryMap[b.id] = b.category;
      productCostMap[b.id] = b.cost;
    });

    // 1. Roll up Sales
    sales.forEach((s) => {
      const cat = productCategoryMap[s.breadId] || 'Other';
      if (!totals[cat]) {
        totals[cat] = {
          category: cat,
          revenue: 0,
          unitsSold: 0,
          unitsProduced: 0,
          unitsScrapped: 0,
          wasteLoss: 0,
        };
      }
      totals[cat].revenue += s.totalAmount;
      totals[cat].unitsSold += s.quantitySold;
    });

    // 2. Roll up Production
    production.forEach((p) => {
      const cat = productCategoryMap[p.breadId] || 'Other';
      const cost = productCostMap[p.breadId] || 0;
      
      if (!totals[cat]) {
        totals[cat] = {
          category: cat,
          revenue: 0,
          unitsSold: 0,
          unitsProduced: 0,
          unitsScrapped: 0,
          wasteLoss: 0,
        };
      }
      
      if (p.status === 'Completed') {
        totals[cat].unitsProduced += p.quantityProduced;
      }
      totals[cat].unitsScrapped += p.quantityScrapped;
      totals[cat].wasteLoss += p.quantityScrapped * cost;
    });

    return Object.values(totals);
  },

  /**
   * Generates key KPI metrics comparing sales vs cost vs scrap
   */
  getAnalyticsKPIs(breads: Bread[], production: Production[], sales: Sale[]) {
    const summary = computeFinancials(sales, production, breads);
    const lowStockCount = breads.filter((b) => b.isActive && b.currentStock <= b.minStock).length;
    
    const completedProd = production.filter(p => p.status === 'Completed');
    const totalBaked = completedProd.reduce((sum, p) => sum + p.quantityProduced, 0);
    const totalScrapped = production.reduce((sum, p) => sum + p.quantityScrapped, 0);
    const scrapRate = totalBaked + totalScrapped > 0 
      ? (totalScrapped / (totalBaked + totalScrapped)) * 100 
      : 0;

    return {
      totalRevenue: summary.totalRevenue,
      netProfit: summary.netProfit,
      scrapLoss: summary.totalScrappedLoss,
      scrapRate: parseFloat(scrapRate.toFixed(1)),
      lowStockCount,
      totalBreadsCatalog: breads.filter(b => b.isActive).length,
    };
  },

  /**
   * Accumulates standard financial ledger fields
   */
  getOperatingLedger(sales: Sale[], production: Production[], breads: Bread[]) {
    const summary = computeFinancials(sales, production, breads);
    const completedProd = production.filter(p => p.status === 'Completed');
    const totalBaked = completedProd.reduce((sum, p) => sum + p.quantityProduced, 0);
    const totalScrapped = production.reduce((sum, p) => sum + p.quantityScrapped, 0);
    const totalPlanned = production.reduce((sum, p) => sum + p.quantityPlanned, 0);
    
    const scrapRate = totalBaked + totalScrapped > 0 
      ? (totalScrapped / (totalBaked + totalScrapped)) * 100 
      : 0;

    return {
      totalRevenue: summary.totalRevenue,
      totalCostOfSales: summary.totalCostOfSales,
      totalScrappedLoss: summary.totalScrappedLoss,
      netProfit: summary.netProfit,
      totalPlanned,
      totalProduced: totalBaked,
      totalScrapped,
      scrapRate,
    };
  },

  /**
   * Aggregates item sales split grouped by category
   */
  getCategoryDistribution(sales: Sale[], breads: Bread[]): { category: string; quantity: number }[] {
    const breadCategoryMap: { [id: string]: string } = {};
    breads.forEach((b) => {
      breadCategoryMap[b.id] = b.category;
    });

    const categoryCounts: { [category: string]: number } = {};
    sales.forEach((s) => {
      const cat = breadCategoryMap[s.breadId] || 'Sourdough';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + s.quantitySold;
    });

    return Object.entries(categoryCounts).map(([category, quantity]) => ({
      category,
      quantity,
    }));
  }
};
