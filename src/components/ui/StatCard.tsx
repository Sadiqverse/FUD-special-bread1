/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Card from './Card';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: string | number;
    type: 'up' | 'down' | 'neutral';
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  className = '',
}) => {
  return (
    <Card hoverable className={`flex flex-col gap-6 relative overflow-hidden p-6 border-b-2 border-b-editorial-gold/30 ${className}`}>
      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-col gap-3">
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-editorial-charcoal/50 dark:text-editorial-cream/50 select-none">
            {title}
          </span>
          <span className="text-3xl sm:text-4.5xl font-serif font-normal text-editorial-charcoal dark:text-editorial-cream tracking-tight leading-none">
            {value}
          </span>
        </div>
        <div className="p-2 text-editorial-gold bg-[#C68E5A]/5 border border-[#C68E5A]/20 rounded-none shrink-0">
          {icon}
        </div>
      </div>
      {(description || trend) && (
        <div className="text-[10px] uppercase tracking-wider flex flex-wrap items-center gap-1.5 pt-3 border-t border-editorial-charcoal/5 dark:border-white/5 font-sans">
          {trend && (
            <span
              className={`font-bold ${
                trend.type === 'up'
                  ? 'text-emerald-705 dark:text-emerald-400'
                  : trend.type === 'down'
                  ? 'text-red-700'
                  : 'text-zinc-550'
              }`}
            >
              {trend.value}
            </span>
          )}
          {description && <span className="text-zinc-500 dark:text-zinc-400 font-medium">{description}</span>}
        </div>
      )}
    </Card>
  );
};

export default StatCard;
