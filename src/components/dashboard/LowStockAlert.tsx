/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Bread } from '../../utils/types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface LowStockAlertProps {
  breads: Bread[];
  onTriggerBaking: (bread: Bread) => void;
  userRole?: string;
}

export const LowStockAlert: React.FC<LowStockAlertProps> = ({
  breads,
  onTriggerBaking,
  userRole = 'Admin',
}) => {
  const lowStockItems = breads.filter((b) => b.isActive && b.currentStock <= b.minStock);

  if (lowStockItems.length === 0) {
    return (
      <Card className="border-[#5A5A40]/30 bg-[#5A5A40]/5 p-6 rounded-none select-none">
        <div className="flex items-start gap-4">
          <div className="p-2 text-[#5A5A40] border border-[#5A5A40]/20 rounded-none shrink-0 bg-[#5A5A40]/5">
            <CheckCircle2 className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col">
            <h4 className="font-serif text-lg italic leading-tight text-editorial-charcoal dark:text-editorial-cream">
              Inventory Stable & Replete
            </h4>
            <p className="text-xs text-editorial-charcoal/70 dark:text-editorial-cream/70 mt-1 font-sans">
              All bread catalog lines are safely stocked above minimum baking thresholds.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const canLogBaking = userRole === 'Admin' || userRole === 'Baker';

  return (
    <Card className="border-red-650/30 bg-red-50/5 p-6 rounded-none select-none flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div className="p-2 text-red-650 border border-red-650/20 rounded-none shrink-0 bg-red-650/5 animate-pulse">
          <AlertTriangle className="h-4.5 w-4.5" />
        </div>
        <div className="flex flex-col">
          <h4 className="font-serif text-lg italic leading-tight text-red-900 dark:text-red-400">
            Critical Depletion Alerts ({lowStockItems.length})
          </h4>
          <p className="text-xs text-editorial-charcoal/70 dark:text-editorial-cream/70 mt-1 font-sans">
            The following loaves are running dangerously low. Please prepare active oven runs.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 max-h-[160px] overflow-y-auto pr-1">
        {lowStockItems.map((b) => (
          <div
            key={b.id}
            className="flex items-center justify-between p-3 bg-white dark:bg-zinc-950 border border-editorial-charcoal/10 dark:border-white/10 rounded-none text-xs hover:border-editorial-gold/45 transition-colors"
          >
            <div className="flex flex-col font-sans">
              <span className="font-bold text-editorial-charcoal dark:text-editorial-cream font-serif italic text-sm">{b.name}</span>
              <span className="text-[10px] text-editorial-charcoal/65 dark:text-editorial-cream/60 mt-1 uppercase tracking-wider">
                Depleted: <strong className="text-red-650 font-bold">{b.currentStock}</strong> / {b.minStock} min threshold
              </span>
            </div>
            
            {canLogBaking ? (
              <button
                onClick={() => onTriggerBaking(b)}
                className="text-[10px] font-bold text-[#C68E5A] hover:text-[#b07d4b] uppercase tracking-widest underline decoration-2 cursor-pointer select-none"
              >
                Schedule Batch
              </button>
            ) : (
              <Badge variant="danger">Restock Urgent</Badge>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default LowStockAlert;
