/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
  ...props
}) => {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-none text-[9px] uppercase tracking-widest font-bold select-none border';
  
  const variants = {
    primary: 'bg-[#C68E5A]/5 text-[#C68E5A] border-[#C68E5A]/30',
    success: 'bg-[#5A5A40]/5 text-[#3e3e2c] dark:text-[#E2E2D9] border-[#5A5A40]/40',
    warning: 'bg-yellow-50 text-yellow-805 dark:bg-yellow-950/10 dark:text-yellow-405 border-yellow-200 dark:border-yellow-900/30',
    danger: 'bg-red-50 text-red-700 dark:bg-red-950/10 dark:text-red-400 border-red-200 dark:border-red-900/35',
    info: 'bg-blue-50 text-blue-705 dark:bg-blue-950/10 dark:text-blue-400 border-blue-200 dark:border-blue-900/35',
    neutral: 'bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800',
  };

  return (
    <span id={props.id} className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;
