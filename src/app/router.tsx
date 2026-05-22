/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import DashboardLayout from '../layouts/DashboardLayout';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import BreadPage from '../pages/bread/BreadPage';
import ProductionPage from '../pages/production/ProductionPage';
import SalesPage from '../pages/sales/SalesPage';
import ReportsPage from '../pages/reports/ReportsPage';
import NotFoundPage from '../pages/NotFoundPage';

export const Router: React.FC = () => {
  const { user, profile, loading } = useAuth();
  
  // Use state-based route switching to manage active workspace panel cleanly
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Sync routing state based on authentication sessions
  useEffect(() => {
    if (!loading) {
      if (!user) {
        setCurrentTab('login');
      } else if (currentTab === 'login') {
        setCurrentTab('dashboard');
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 gap-4">
        {/* Fine baking animated loading sequence */}
        <div className="relative flex items-center justify-center">
          <svg
            className="animate-spin h-10 w-10 text-amber-600"
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
        </div>
        <span className="text-xs font-semibold text-zinc-420 font-mono tracking-wider uppercase select-none">
          Warming bakehouse ovens...
        </span>
      </div>
    );
  }

  // Render Login page if not authenticated
  if (!user || currentTab === 'login') {
    return <LoginPage />;
  }

  // Render standard workspaces inside layout template
  const renderWorkspaceContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'bread':
        return <BreadPage />;
      case 'production':
        return <ProductionPage />;
      case 'sales':
        return <SalesPage />;
      case 'reports':
        // Enforce admin permission guards
        if (profile?.role !== 'Admin') {
          return <DashboardPage />;
        }
        return <ReportsPage />;
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <DashboardLayout currentTab={currentTab} onTabChange={setCurrentTab}>
      {renderWorkspaceContent()}
    </DashboardLayout>
  );
};

export default Router;
