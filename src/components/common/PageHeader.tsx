/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-6 mb-8 border-b border-editorial-charcoal/10 dark:border-white/10">
      <div className="flex flex-col">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-editorial-charcoal dark:text-editorial-cream tracking-tight leading-none">
          {title}
        </h1>
        {description && (
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] mt-3.5 text-editorial-charcoal/60 dark:text-editorial-cream/60 leading-relaxed max-w-2xl font-sans font-medium">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 flex items-center md:pb-1">{action}</div>}
    </div>
  );
};

export default PageHeader;
