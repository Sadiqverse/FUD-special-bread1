/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ShieldAlert } from 'lucide-react';
import Button from '../ui/Button';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('Admin' | 'Baker' | 'Cashier')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, profile, loading, logOut } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <svg
          className="animate-spin h-8 w-8 text-amber-600"
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
        <span className="text-xs font-semibold text-zinc-500 tracking-wide uppercase select-none">
          Verifying security credential...
        </span>
      </div>
    );
  }

  // Redirect to login handled by App.tsx router, but let's guard here as fallback
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
        <ShieldAlert className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-3 animate-pulse" />
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Session Required</h3>
        <p className="text-xs text-zinc-500 max-w-xs mt-1 mb-4">Please log in to continue.</p>
      </div>
    );
  }

  // Enforce roles restriction
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-red-100 dark:border-red-950/20 max-w-xl mx-auto my-12">
        <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 border border-red-101 dark:border-red-900/30 rounded-full mb-3 shadow-xs">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-101 mb-1">
          Access Restricted
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mb-4 leading-relaxed">
          Your current security clearance (<span className="font-bold text-amber-600">{profile.role}</span>) does not have authorization to view this resource. Contact your supervisor or switch roles to view this pane.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            Go Back
          </Button>
          <Button variant="secondary" size="sm" onClick={logOut}>
            Use Different Account
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
