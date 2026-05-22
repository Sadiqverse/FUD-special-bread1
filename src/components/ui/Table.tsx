/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  headers: string[];
}

export const Table: React.FC<TableProps> = ({
  headers,
  children,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full overflow-x-auto border-t border-b border-editorial-charcoal/20 dark:border-white/25 rounded-none bg-white dark:bg-zinc-950">
      <table id={props.id} className={`w-full text-left border-collapse ${className}`} {...props}>
        <thead>
          <tr className="bg-editorial-cream/20 dark:bg-zinc-900/40 border-b border-editorial-charcoal/15 dark:border-white/10 select-none text-[10px] font-normal font-serif italic text-editorial-charcoal/65 dark:text-editorial-cream/65 uppercase tracking-[0.18em] px-4">
            {headers.map((header, idx) => (
              <th key={idx} className="px-5 py-3.5 whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-editorial-charcoal/5 dark:divide-white/5 text-xs text-editorial-charcoal dark:text-neutral-300 font-sans">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
