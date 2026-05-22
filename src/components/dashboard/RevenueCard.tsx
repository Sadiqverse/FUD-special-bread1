/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Bread, Production, Sale } from '../../utils/types';
import { computeFinancials } from '../../utils/calculations';
import { formatCurrency } from '../../utils/helpers';
import Card from '../ui/Card';
import SectionTitle from '../common/SectionTitle';
import { Percent, Scale } from 'lucide-react';

export interface RevenueCardProps {
  breads: Bread[];
  production: Production[];
  sales: Sale[];
}

export const RevenueCard: React.FC<RevenueCardProps> = ({
  breads,
  production,
  sales,
}) => {
  const summary = computeFinancials(sales, production, breads);

  const profitMarginPercent = summary.totalRevenue > 0
    ? (summary.netProfit / summary.totalRevenue) * 100
    : 0;

  return (
    <Card className="flex flex-col gap-6 relative overflow-hidden rounded-none p-6">
      <SectionTitle title="Operating Ledger" subtitle="Profitability snapshot including waste write-offs" />

      <div className="flex flex-col gap-5 pt-1 select-none">
        {/* Major KPI: Net Profit */}
        <div className="p-5 bg-editorial-cream/35 dark:bg-zinc-900/60 rounded-none border border-editorial-charcoal/10 dark:border-white/10 flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-editorial-charcoal/50 dark:text-editorial-cream/50 uppercase tracking-[0.15em]">Takehome Net Profit</span>
            <span className={`text-2xl font-serif font-normal ${summary.netProfit >= 0 ? 'text-editorial-charcoal dark:text-editorial-cream' : 'text-red-700'}`}>
              {formatCurrency(summary.netProfit)}
            </span>
          </div>
          <div className="text-right flex flex-col items-end gap-1.5">
            <span className="text-[10px] text-zinc-400 font-mono tracking-wider">MARGIN</span>
            <span className="font-mono text-[10px] font-bold inline-flex items-center gap-1 text-editorial-gold border border-editorial-gold/20 px-2.5 py-0.5 rounded-none shrink-0">
              <Percent className="h-3 w-3" /> {profitMarginPercent.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Ledger items */}
        <div className="flex flex-col gap-3 text-xs px-1 font-sans">
          <div className="flex justify-between items-center text-editorial-charcoal/80 dark:text-editorial-cream/85 pb-1 border-b border-editorial-charcoal/5 dark:border-white/5">
            <span className="font-medium text-[11px] uppercase tracking-wider">Gross Cash Receipts:</span>
            <strong className="text-editorial-charcoal dark:text-editorial-cream font-mono font-bold text-xs">
              {formatCurrency(summary.totalRevenue)}
            </strong>
          </div>
          <div className="flex justify-between items-center text-editorial-charcoal/80 dark:text-editorial-cream/85 pb-1 border-b border-editorial-charcoal/5 dark:border-white/5">
            <span className="font-medium text-[11px] uppercase tracking-wider">Baking Ingredient COGS:</span>
            <span className="text-zinc-600 dark:text-zinc-400 font-mono text-xs">
              - {formatCurrency(summary.totalCostOfSales)}
            </span>
          </div>
          <div className="flex justify-between items-center font-semibold text-editorial-charcoal dark:text-editorial-cream pb-1 border-b border-editorial-charcoal/5 dark:border-white/5">
            <span className="text-[11px] uppercase tracking-wider">Gross Sales Income:</span>
            <span className="font-mono text-xs">
              {formatCurrency(summary.grossProfit)}
            </span>
          </div>
          <div className="flex justify-between items-center text-editorial-charcoal/80 dark:text-editorial-cream/85 pb-1">
            <span className="font-medium text-[11px] uppercase tracking-wider flex items-center gap-1">
              Damaged/Scrapped Losses:
            </span>
            <span className="text-red-650 font-mono text-xs">
              - {formatCurrency(summary.totalScrappedLoss)}
            </span>
          </div>
        </div>
        
        {/* Tiny financial warning notice if waste is excessive */}
        {summary.totalScrappedLoss > 0 && summary.grossProfit > 0 && (
          <div className="p-3 bg-red-650/5 border border-red-600/20 text-[10px] uppercase tracking-wider text-red-705 dark:text-red-400 leading-normal flex items-start gap-1.5 font-sans font-bold">
            <Scale className="h-3.5 w-3.5 shrink-0" />
            <span>
              Waste stands at {((summary.totalScrappedLoss / summary.grossProfit) * 100).toFixed(0)}% of profit. Tune batch counts down.
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RevenueCard;
