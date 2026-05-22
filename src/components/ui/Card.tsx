/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  className = '',
  ...props
}) => {
  return (
    <div
      id={props.id}
      className={`bg-white dark:bg-zinc-900 border border-editorial-charcoal/10 dark:border-zinc-800 rounded-xs p-6 shadow-none transition-all duration-200 ${
        hoverable ? 'hover:border-editorial-gold dark:hover:border-editorial-gold/65' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
