/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useBread } from '../../hooks/useBread';
import { useProduction } from '../../hooks/useProduction';
import { useSales } from '../../hooks/useSales';
import { useAuth } from '../../hooks/useAuth';
import { ReportsService } from '../../services/reports.service';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import LowStockAlert from '../../components/dashboard/LowStockAlert';
import SalesChart from '../../components/dashboard/SalesChart';
import RecentActivity from '../../components/dashboard/RecentActivity';
import RevenueCard from '../../components/dashboard/RevenueCard';
import Modal from '../../components/ui/Modal';
import ProductionForm from '../../components/forms/ProductionForm';
import { 
  DollarSign, 
  Flame, 
  AlertTriangle, 
  Box, 
  Database,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Bread } from '../../utils/types';

export const DashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const { breads, addBread, seedDemoData } = useBread();
  const { production, addProduction } = useProduction();
  const { sales } = useSales();

  const [bakingModalOpen, setBakingModalOpen] = useState(false);
  const [selectedBakingBread, setSelectedBakingBread] = useState<Bread | null>(null);

  // Compute stats via compiled ledger calculations
  const kpis = ReportsService.getAnalyticsKPIs(breads, production, sales);
  const salesHistoryChart = ReportsService.getDailySalesTrend(sales, 7);

  // Quick schedule action
  const handleTriggerBaking = (bread: Bread) => {
    setSelectedBakingBread(bread);
    setBakingModalOpen(true);
  };

  const handleBakingSubmit = async (runData: any) => {
    await addProduction(runData);
    setBakingModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Bakehouse Dashboard"
        description={`Welcome back, ${profile?.displayName || 'Teammate'}! Here is your business activities log.`}
        action={
          breads.length === 0 ? (
            <Button
              variant="outline"
              onClick={seedDemoData}
              icon={<Database className="h-4 w-4 text-amber-600" />}
              className="animate-pulse shadow-xs border-amber-200"
            >
              Seed Sandbox Catalog
            </Button>
          ) : null
        }
      />

      {/* Primary stock triggers */}
      <LowStockAlert
        breads={breads}
        onTriggerBaking={handleTriggerBaking}
        userRole={profile?.role}
      />

      {/* Main Stat Cards Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Daily Gross Proceeds"
          value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(kpis.totalRevenue)}
          icon={<DollarSign className="h-5 w-5" />}
          description="Gross cashier takings"
        />
        <StatCard
          title="Net Take-Home Income"
          value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(kpis.netProfit)}
          icon={<TrendingUpIcon />}
          description="Receipts net of COGS & scrap"
        />
        <StatCard
          title="Active Oven Scrap Rate"
          value={`${kpis.scrapRate}%`}
          icon={<Flame className="h-5 w-5" />}
          description="Damaged items vs total baking"
          trend={{
            value: kpis.scrapLoss > 0 ? `-$${kpis.scrapLoss.toFixed(0)} waste` : 'Optimized',
            type: kpis.scrapRate > 10 ? 'down' : 'up',
          }}
        />
        <StatCard
          title="Low Stock Red Alarms"
          value={kpis.lowStockCount}
          icon={<AlertTriangle className="h-5 w-5" />}
          description="Items below minimum limits"
          trend={{
            value: `${kpis.totalBreadsCatalog} Active Breads`,
            type: 'neutral',
          }}
        />
      </div>

      {/* Middle Grid: Chart and Operating Ledger Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart data={salesHistoryChart} />
        </div>
        <div>
          <RevenueCard breads={breads} production={production} sales={sales} />
        </div>
      </div>

      {/* Bottom Grid: Live Activities Log */}
      <div className="grid grid-cols-1 gap-6">
        <RecentActivity sales={sales} production={production} />
      </div>

      {/* Fast Baking Trigger popup modal */}
      <Modal
        isOpen={bakingModalOpen}
        onClose={() => setBakingModalOpen(false)}
        title={`Logs Daily Bake: ${selectedBakingBread?.name}`}
      >
        {selectedBakingBread && (
          <ProductionForm
            breads={[selectedBakingBread]}
            initialData={null}
            onSubmit={handleBakingSubmit}
          />
        )}
      </Modal>
    </div>
  );
};

export default DashboardPage;

// Minor inner icon helper to prevent bloated SVG lines
function TrendingUpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}
