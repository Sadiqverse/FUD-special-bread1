/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useData } from '../context/DataContext';
import { Sun, Moon, Sparkles, LogOut, Menu, X, ShieldAlert, Award, ChefHat, Building2 } from 'lucide-react';
import Button from '../components/ui/Button';

export interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
}) => {
  const { profile, updateUserRole, logOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isDemoMode } = useData();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const roles: ('Admin' | 'Baker' | 'Cashier')[] = ['Admin', 'Baker', 'Cashier'];

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUserRole(e.target.value as any);
  };

  const navtabs = [
    { id: 'dashboard', label: 'Dashboard', roles: ['Admin', 'Baker', 'Cashier'] },
    { id: 'bread', label: 'Bread Catalog', roles: ['Admin', 'Baker', 'Cashier'] },
    { id: 'production', label: 'Production', roles: ['Admin', 'Baker'] },
    { id: 'sales', label: 'POS Checkout', roles: ['Admin', 'Cashier'] },
    { id: 'reports', label: 'Ledgers', roles: ['Admin'] },
  ];

  return (
    <header className="h-16 border-b border-editorial-charcoal/10 dark:border-white/10 bg-editorial-cream dark:bg-zinc-950 flex items-center justify-between px-6 z-40 select-none relative">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 hover:bg-editorial-charcoal/5 dark:hover:bg-white/5 text-editorial-charcoal dark:text-editorial-cream rounded-none cursor-pointer"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Small screen branding */}
        <div className="flex md:hidden items-center gap-1.5 font-serif italic text-base text-editorial-charcoal dark:text-editorial-cream tracking-tight">
          <span>Artesano</span>
        </div>

        {/* Local sandbox notice banner */}
        {isDemoMode && (
          <div className="hidden lg:flex items-center gap-1.5 bg-[#C68E5A]/5 text-[#C68E5A] px-3 py-1.5 rounded-none text-[10px] uppercase tracking-wider font-bold border border-[#C68E5A]/25">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
            <span>Sandbox Mode (Offline State)</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Dynamic testing role switcher */}
        {profile && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-editorial-charcoal/15 dark:border-white/10 rounded-none text-[10px] uppercase tracking-wider">
            <Award className="h-3.5 w-3.5 text-[#C68E5A] hide lg:inline mr-1" />
            <span className="hidden sm:inline text-editorial-charcoal/50 dark:text-editorial-cream/50 font-bold mr-0.5 pointer-events-none">Current Role:</span>
            <select
              value={profile.role}
              onChange={handleRoleChange}
              className="bg-transparent text-[#C68E5A] font-extrabold outline-hidden pr-2 cursor-pointer rounded-none font-sans"
            >
              {roles.map((r) => (
                <option key={r} value={r} className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100">
                  {r}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Light/Dark Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-550 dark:text-zinc-350 rounded-lg transition-colors cursor-pointer"
          title={theme === 'light' ? 'Activate Night Mode' : 'Activate Day Mode'}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 bg-white dark:bg-zinc-950 border-b border-zinc-150 dark:border-zinc-800 p-4 md:hidden flex flex-col gap-2 z-50 shadow-lg animate-in slide-in-from-top-4 duration-200">
          <SectionTitle title="Navigate Workspaces" className="mb-1" />
          {navtabs.map((tab) => {
            const isActive = currentTab === tab.id;
            const allowed = profile ? tab.roles.includes(profile.role) : false;

            if (!allowed) return null;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm font-semibold rounded-lg ${
                  isActive
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
          
          <div className="h-px bg-zinc-100 dark:bg-zinc-810 mt-2" />
          <button
            onClick={logOut}
            className="w-full text-left px-3 py-2 text-sm font-semibold text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-955/20 flex gap-2 items-center"
          >
            <LogOut className="h-4.5 w-4.5" /> Sign Out
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;

// Minor local title helper
function SectionTitle({ title, className = '' }: { title: string; className?: string }) {
  return <span className={`text-[10px] font-bold text-zinc-400 uppercase tracking-wider ${className}`}>{title}</span>;
}
