/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  BarChart3, 
  ChefHat, 
  Coins, 
  LogOut,
  Layers,
  Home,
  ShieldCheck
} from 'lucide-react';
import Button from '../components/ui/Button';

export interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
}) => {
  const { profile, logOut } = useAuth();

  const navigationItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      num: '01',
      allowedRoles: ['Admin', 'Baker', 'Cashier']
    },
    { 
      id: 'bread', 
      label: 'Catalog', 
      num: '02',
      allowedRoles: ['Admin', 'Baker', 'Cashier']
    },
    { 
      id: 'production', 
      label: 'Production', 
      num: '03',
      allowedRoles: ['Admin', 'Baker']
    },
    { 
      id: 'sales', 
      label: 'POS Register', 
      num: '04',
      allowedRoles: ['Admin', 'Cashier']
    },
    { 
      id: 'reports', 
      label: 'Ledger Reports', 
      num: '05',
      allowedRoles: ['Admin']
    },
  ];

  return (
    <aside className="w-64 bg-[#1A1A1A] text-[#FDFCF8] hidden md:flex flex-col h-screen shrink-0 relative select-none p-8 justify-between border-r border-[#1A1A1A]/10">
      <div>
        {/* Brand Header */}
        <div className="mb-12">
          <h2 className="font-serif italic text-2xl tracking-normal text-white">Artesano</h2>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#C68E5A] font-semibold opacity-85">Bakery Ledger v2.4</p>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex flex-col gap-6 font-sans">
          {navigationItems.map((item) => {
            const isActive = currentTab === item.id;
            const allowed = profile ? item.allowedRoles.includes(profile.role) : false;

            if (!allowed) return null;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 text-left text-xs uppercase tracking-[0.2em] font-medium transition-all duration-250 cursor-pointer ${
                  isActive
                    ? 'text-white font-extrabold translate-x-1'
                    : 'text-[#FDFCF8]/40 hover:text-white'
                }`}
              >
                <span className="font-serif italic text-[11px] opacity-60 mr-1">{item.num}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Cashier / Operator Profile Summary */}
      {profile && (
        <div className="pt-8 border-t border-white/10 flex flex-col gap-4">
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-full bg-[#C68E5A] flex items-center justify-center text-[11px] font-bold text-white uppercase shrink-0">
              {profile.displayName.substring(0, 2)}
            </div>
            <div className="flex flex-col overflow-hidden leading-tight">
              <span className="text-[11px] font-bold text-white truncate">{profile.displayName}</span>
              <span className="text-[9px] text-zinc-400 truncate flex items-center gap-1 font-mono uppercase mt-0.5">
                {profile.role}
              </span>
            </div>
          </div>
          
          <button
            onClick={logOut}
            className="w-full flex items-center gap-1.5 justify-start text-[9px] uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors cursor-pointer bg-transparent border-none p-0"
          >
            <LogOut className="h-3 w-3" />
            <span>Leave Terminal</span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
