/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold uppercase tracking-[0.18em] transition-all duration-200 focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-none';
  
  const variants = {
    primary: 'bg-editorial-charcoal text-white hover:bg-white hover:text-editorial-charcoal border border-editorial-charcoal dark:bg-editorial-cream dark:text-editorial-charcoal dark:hover:bg-editorial-charcoal dark:hover:text-white dark:border-editorial-cream',
    secondary: 'bg-[#C68E5A] hover:bg-[#b07d4b] text-white border border-[#C68E5A]',
    danger: 'bg-red-700 hover:bg-white hover:text-red-700 border border-red-700 text-white',
    outline: 'border border-editorial-charcoal/20 hover:border-editorial-charcoal text-editorial-charcoal dark:border-white/20 dark:hover:border-white dark:text-editorial-cream',
    ghost: 'hover:bg-editorial-charcoal/5 dark:hover:bg-white/5 text-editorial-charcoal/80 dark:text-editorial-cream/80',
  };

  const sizes = {
    sm: 'px-3.5 py-2 text-[9px] gap-1.5',
    md: 'px-5 py-2.5 text-[10px] gap-2',
    lg: 'px-7 py-3 text-xs gap-2.5',
  };

  return (
    <button
      id={props.id}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-3.5 w-3.5 text-current mr-1.5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};

export default Button;
