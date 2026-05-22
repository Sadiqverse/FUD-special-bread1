/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Leaf } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon = <Leaf className="h-10 w-10 text-zinc-350 dark:text-zinc-600" />,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-zinc-50/50 dark:bg-zinc-900/30 border border-dashed border-zinc-200 dark:border-zinc-805/80 rounded-xl">
      <div className="mb-4 p-3 bg-white dark:bg-zinc-900 rounded-full shadow-xs border border-zinc-100 dark:border-zinc-800">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-105 mb-1">
        {title}
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mb-4">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 rounded-lg transition-colors cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
