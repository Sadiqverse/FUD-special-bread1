/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../hooks/useAuth';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentTab,
  onTabChange,
}) => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-editorial-cream dark:bg-zinc-950 font-sans antialiased text-editorial-charcoal dark:text-editorial-cream">
      {/* Left fixed navigation sidebar on desktop */}
      <Sidebar currentTab={currentTab} onTabChange={onTabChange} />

      {/* Main viewport panels */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top universal Header */}
        <Navbar currentTab={currentTab} onTabChange={onTabChange} />

        {/* Scrollable primary card deck */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:p-6 lg:p-8 relative">
          <div className="max-w-7xl mx-auto flex flex-col gap-6 w-full h-full animate-in fade-in duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
