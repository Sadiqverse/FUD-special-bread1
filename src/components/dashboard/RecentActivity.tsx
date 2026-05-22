/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sale, Production } from '../../utils/types';
import { formatDate, formatCurrency } from '../../utils/helpers';
import Card from '../ui/Card';
import SectionTitle from '../common/SectionTitle';
import { CalendarDays } from 'lucide-react';

interface CombinedActivity {
  id: string;
  type: 'sale' | 'production';
  title: string;
  detail: string;
  timestamp: string;
  date: string;
  operator: string;
}

export interface RecentActivityProps {
  sales: Sale[];
  production: Production[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  sales,
  production,
}) => {
  // Combine lists of sales and production
  const activities: CombinedActivity[] = [];

  sales.slice(0, 5).forEach((s) => {
    activities.push({
      id: s.id,
      type: 'sale',
      title: `Sale Out: ${s.breadName}`,
      detail: `Sold ${s.quantitySold} loaves for ${formatCurrency(s.totalAmount)} via ${s.paymentMethod}`,
      timestamp: s.createdAt,
      date: s.date,
      operator: s.soldByEmail ? s.soldByEmail.split('@')[0] : 'Cashier',
    });
  });

  production.slice(0, 5).forEach((p) => {
    let actionStr = `Planned baking batch`;
    if (p.status === 'Completed') {
      actionStr = `Output Logged: ${p.quantityProduced} baked, ${p.quantityScrapped} loss`;
    } else if (p.status === 'In Progress') {
      actionStr = `Started baking run`;
    } else if (p.status === 'Cancelled') {
      actionStr = `Batch Cancelled`;
    }

    activities.push({
      id: p.id,
      type: 'production',
      title: `${p.breadName} (${p.status})`,
      detail: `${actionStr} (target: ${p.quantityPlanned})`,
      timestamp: p.createdAt,
      date: p.date,
      operator: p.bakerEmail ? p.bakerEmail.split('@')[0] : 'Baker',
    });
  });

  // Sort by creation timestamp descending
  const sortedActivities = activities
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 6);

  if (sortedActivities.length === 0) {
    return (
      <Card className="flex flex-col gap-4 rounded-none">
        <SectionTitle title="Live Activity Log" subtitle="Recent floor movements" />
        <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-editorial-charcoal/15 dark:border-white/10 rounded-none h-[180px] select-none">
          <CalendarDays className="h-8 w-8 text-zinc-350 dark:text-zinc-600 mb-2" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Silent Floor</span>
          <span className="text-[11px] font-serif italic text-zinc-455 mt-0.5">Submit checkout sales or oven logs.</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-6 rounded-none p-6">
      <SectionTitle title="Live Activity Log" subtitle="Recent checkout sales and oven logs" />

      <div className="flex flex-col relative before:absolute before:inset-y-0 before:left-3 before:w-px before:bg-editorial-charcoal/10 dark:before:bg-white/10 max-h-[260px] overflow-y-auto pr-1">
        {sortedActivities.map((act) => {
          const isSale = act.type === 'sale';
          return (
            <div key={act.id} className="flex gap-4 p-3 relative group hover:bg-editorial-cream/25 dark:hover:bg-zinc-900/20 rounded-none transition-colors select-none">
              {/* Event Dot */}
              <div className={`h-6 w-6 rounded-none shrink-0 flex items-center justify-center border font-serif text-[10px] font-bold z-10 ${
                isSale 
                  ? 'bg-editorial-cream text-editorial-charcoal border-editorial-charcoal/20 dark:bg-zinc-900 dark:text-editorial-cream dark:border-white/20' 
                  : act.title.includes('Completed')
                  ? 'bg-[#C68E5A] text-white border-[#C68E5A]'
                  : 'bg-zinc-100 text-zinc-650 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
              }`}>
                {isSale ? 'S' : 'P'}
              </div>

              {/* Detail fields */}
              <div className="flex flex-col gap-0.5 flex-1 pl-1">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-bold text-editorial-charcoal dark:text-editorial-cream text-left leading-tight">
                    {act.title}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono whitespace-nowrap">
                    {formatDate(act.date)}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal font-sans mt-0.5">
                  {act.detail}
                </p>
                <span className="text-[9px] font-mono text-zinc-450 dark:text-zinc-500 mt-1 uppercase tracking-wider">
                  OPERATOR: {act.operator}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default RecentActivity;
