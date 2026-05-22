/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', type = 'text', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 font-sans">
        {label && (
          <label className="text-[10px] uppercase tracking-widest font-bold text-editorial-charcoal/60 dark:text-editorial-cream/60 select-none">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={props.id}
            type={type}
            ref={ref}
            className={`w-full px-4 py-2.5 bg-white dark:bg-zinc-950 border text-xs rounded-none transition-all duration-150 focus:outline-hidden focus:border-editorial-gold disabled:bg-zinc-50 dark:disabled:bg-zinc-900 disabled:opacity-60 text-editorial-charcoal dark:text-editorial-cream placeholder-zinc-400 ${
              error
                ? 'border-red-550 focus:border-red-550'
                : 'border-editorial-charcoal/20 dark:border-zinc-800'
            } ${className}`}
            {...props}
          />
        </div>
        {error ? (
          <span className="text-[10px] uppercase font-bold text-red-650 select-none tracking-wider">{error}</span>
        ) : helperText ? (
          <span className="text-[10px] text-zinc-400 select-none italic font-serif tracking-wider">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
