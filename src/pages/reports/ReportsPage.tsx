/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSales } from '../../hooks/useSales';
import { useProduction } from '../../hooks/useProduction';
import { useBread } from '../../hooks/useBread';
import { useAuth } from '../../hooks/useAuth';
import { ReportsService } from '../../services/reports.service';
import { formatCurrency } from '../../utils/helpers';
import PageHeader from '../../components/common/PageHeader';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import Card from '../../components/ui/Card';
import SectionTitle from '../../components/common/SectionTitle';
import Badge from '../../components/ui/Badge';
import { 
  TrendingUp, 
  Flame, 
  DollarSign, 
  PieChart, 
  CalendarDays, 
  ArrowUpDown, 
  Leaf, 
  HelpCircle,
  Building2
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { profile } = useAuth();
  const { breads } = useBread();
  const { sales } = useSales();
  const { production } = useProduction();

  const [dateRange, setDateRange] = useState<'7' | '30' | 'all'>('30');

  // Load audit data
  const ledger = ReportsService.getOperatingLedger(sales, production, breads);
  const categorySummary = ReportsService.getCategoryDistribution(sales, breads);

  const totalSalesVolume = sales.reduce((acc, cr) => acc + cr.quantitySold, 0);

  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Administrative Ledger & Audit Reports"
          description="Consolidated financial takehome, ingredient margins, and inventory waste metrics."
          action={
            <div className="flex items-center gap-1.5 p-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 rounded-lg text-xs select-none">
              <CalendarDays className="h-4 w-4 text-zinc-450 ml-1.5" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="bg-transparent text-zinc-800 dark:text-zinc-100 font-bold outline-hidden pr-2 cursor-pointer"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="all">Entire Ledger</option>
              </select>
            </div>
          }
        />

        {/* Ledger Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Revenue and Net returns */}
          <Card className="flex flex-col gap-4">
            <SectionTitle title="Income Rollup" subtitle="Total checkout sales vs COGS" />
            <div className="flex flex-col gap-3 select-none">
              <div className="flex justify-between items-center text-xs pb-1 border-b border-zinc-100 dark:border-zinc-805">
                <span className="text-zinc-500 font-medium">Bakehouse Gross Revenue:</span>
                <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(ledger.totalRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pb-1 border-b border-zinc-100 dark:border-zinc-805">
                <span className="text-zinc-500 font-medium">Ingredient Costs (COGS):</span>
                <span className="font-semibold font-mono text-zinc-650 dark:text-zinc-300">
                  - {formatCurrency(ledger.totalCostOfSales)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pb-1 border-b border-zinc-100 dark:border-zinc-805">
                <span className="text-zinc-500 font-medium">Baking Wastage Losses:</span>
                <span className="font-semibold font-mono text-red-650">
                  - {formatCurrency(ledger.totalScrappedLoss)}
                </span>
              </div>
              <div className="p-3 bg-emerald-50/15 border border-emerald-100 dark:border-emerald-900/30 rounded-lg flex justify-between items-center mt-2">
                <span className="text-xs text-emerald-705 dark:text-emerald-400 font-semibold uppercase">Net Takehome:</span>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatCurrency(ledger.netProfit)}
                </span>
              </div>
            </div>
          </Card>

          {/* Wastage deepdive audit */}
          <Card className="flex flex-col gap-4">
            <SectionTitle title="Baking Output & Scraps" subtitle="Physical oven loss audit" />
            <div className="flex flex-col gap-3.5 select-none">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-520 font-medium">Target planned loaves:</span>
                <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{ledger.totalPlanned}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-520 font-medium font-sans">Successful good bakes:</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{ledger.totalProduced}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-520 font-medium">Oven burn/scrap counts:</span>
                <strong className="text-red-500 font-mono">{ledger.totalScrapped}</strong>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg flex justify-between items-center text-xs mt-1 border border-zinc-150 dark:border-zinc-805">
                <span className="text-zinc-500 font-semibold uppercase tracking-wider">Average Waste:</span>
                <Badge variant={ledger.scrapRate > 10 ? 'danger' : ledger.scrapRate > 4 ? 'primary' : 'success'}>
                  {ledger.scrapRate.toFixed(1)}% Scrap Rate
                </Badge>
              </div>
            </div>
          </Card>

          {/* Product Category sales split */}
          <Card className="flex flex-col gap-4">
            <SectionTitle title="Category Product Split" subtitle="Volume shares based on sold units" />
            
            {categorySummary.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-4 text-center select-none text-zinc-400 text-xs">
                Complete cashier checkout transactions to build distribution shares logs.
              </div>
            ) : (
              <div className="flex flex-col gap-3 select-none">
                {categorySummary.map((item) => {
                  const percent = totalSalesVolume > 0 ? (item.quantity / totalSalesVolume) * 100 : 0;
                  return (
                    <div key={item.category} className="flex flex-col gap-1.5 text-xs text-zinc-650 dark:text-zinc-300">
                      <div className="flex justify-between">
                        <span className="font-bold">{item.category}</span>
                        <span className="font-mono text-zinc-400">{item.quantity} units ({percent.toFixed(0)}%)</span>
                      </div>
                      {/* CSS-native bar indicator */}
                      <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-805 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-600 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Catalog performance ledger table */}
        <Card className="flex flex-col gap-4">
          <SectionTitle title="Unit Performance Audit" subtitle="Financial health summary of each catalog line item" />

          {breads.length === 0 ? (
            <div className="py-8 text-center select-none text-zinc-400 text-xs">
              Configure breads to analyze health statistics.
            </div>
          ) : (
            <div className="w-full overflow-x-auto border border-zinc-150 dark:border-zinc-805 rounded-xl bg-white dark:bg-zinc-950">
              <table className="w-full text-left border-collapse select-none text-xs sm:text-xs">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-150 dark:border-zinc-800 text-zinc-500 uppercase font-semibold font-mono px-4 text-[10px] tracking-wider">
                    <th className="px-5 py-3">Loaf Name</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Price / Cost</th>
                    <th className="px-5 py-3">Net Profit Margin</th>
                    <th className="px-5 py-3">Units Sold</th>
                    <th className="px-5 py-3">Accumulated Revenue</th>
                    <th className="px-5 py-3">Health Tag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-805 text-zinc-705 dark:text-zinc-300 font-sans">
                  {breads.map((b) => {
                    const unitProfit = b.price - b.cost;
                    const margin = b.price > 0 ? (unitProfit / b.price) * 105 : 0;
                    
                    const itemSales = sales.filter((s) => s.breadId === b.id);
                    const unitsSold = itemSales.reduce((acc, cr) => acc + cr.quantitySold, 0);
                    const itemRevenue = itemSales.reduce((acc, cr) => acc + cr.totalAmount, 0);

                    // Flag item health
                    let healthStatus = 'High Margin';
                    let healthVariant: 'success' | 'primary' | 'danger' | 'neutral' = 'success';
                    if (unitsSold === 0) {
                      healthStatus = 'Stagnant (No sales)';
                      healthVariant = 'neutral';
                    } else if (margin < 30) {
                      healthStatus = 'Low Margin';
                      healthVariant = 'danger';
                    } else if (margin < 50) {
                      healthStatus = 'Balanced';
                      healthVariant = 'primary';
                    }

                    return (
                      <tr key={b.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-zinc-850 dark:text-zinc-100">
                          {b.name}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-zinc-500">
                          {b.category}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          {formatCurrency(b.price)} / <span className="text-zinc-[450]">{formatCurrency(b.cost)}</span>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap font-mono text-xs font-semibold">
                          {margin.toFixed(0)}% Margin
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                          {unitsSold}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                          {formatCurrency(itemRevenue)}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <Badge variant={healthVariant}>{healthStatus}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </ProtectedRoute>
  );
};

export default ReportsPage;
