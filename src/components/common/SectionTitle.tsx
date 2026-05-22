/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface SectionTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  subtitle,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-editorial-charcoal dark:text-editorial-cream flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-editorial-gold" />
        {title}
      </h3>
      {subtitle && (
        <span className="text-[11px] font-serif italic text-zinc-500 dark:text-zinc-400 pl-3.5 tracking-wide">
          {subtitle}
        </span>
      )}
    </div>
  );
};

export default SectionTitle;
