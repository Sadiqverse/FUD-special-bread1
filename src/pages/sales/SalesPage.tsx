/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSales } from '../../hooks/useSales';
import { useBread } from '../../hooks/useBread';
import { useAuth } from '../../hooks/useAuth';
import { Sale } from '../../utils/types';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import SalesForm from '../../components/forms/SalesForm';
import SalesTable from '../../components/tables/SalesTable';
import { Plus, Coins, ShieldAlert } from 'lucide-react';

export const SalesPage: React.FC = () => {
  const { profile } = useAuth();
  const { breads } = useBread();
  const { sales, addSale, deleteSale } = useSales();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  const [saleModalOpen, setSaleModalOpen] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteDetail, setDeleteDetail] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const canEdit = profile?.role === 'Admin' || profile?.role === 'Cashier';

  const handleCreateSale = async (formData: any) => {
    await addSale(formData);
    setSaleModalOpen(false);
  };

  const handleDeleteTrigger = (id: string, detail: string) => {
    setDeleteId(id);
    setDeleteDetail(detail);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteSale(deleteId);
      setDeleteConfirmOpen(false);
      setDeleteId(null);
    }
  };

  // Filter sales list
  const filteredSales = sales.filter((s) => {
    const matchesSearch = s.breadName.toLowerCase().includes(searchQuery.toLowerCase()) || (s.notes && s.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDate = !selectedDate || s.date === selectedDate;
    return matchesSearch && matchesDate;
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="POS Retail Register"
        description="Launch checkout tickets, capture customer transactions, and print shift receipt logs."
        action={
          canEdit && (
            <Button
              variant="primary"
              onClick={() => setSaleModalOpen(true)}
              icon={<Plus className="h-4 w-4" />}
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 border-none text-white font-bold"
            >
              Checkout Sale
            </Button>
          )
        }
      />

      {/* POS filter metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-805 select-none text-xs">
        <div>
          <input
            type="text"
            placeholder="Search transactions or checkout comments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-zinc-805 dark:text-zinc-100 placeholder-zinc-400"
          />
        </div>
        <div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm focus:outline-hidden text-zinc-700 dark:text-zinc-300 cursor-pointer font-sans"
          />
        </div>
      </div>

      {filteredSales.length === 0 ? (
        <EmptyState
          title="No Transaction Records"
          description={
            sales.length === 0
              ? 'No goods checked out today yet. Open POS register above.'
              : 'Try matching other search query keywords or filter dates.'
          }
          icon={<Coins className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />}
        />
      ) : (
        <SalesTable
          sales={filteredSales}
          userRole={profile?.role}
          onDelete={handleDeleteTrigger}
        />
      )}

      {/* Retail Sale popup */}
      <Modal
        isOpen={saleModalOpen}
        onClose={() => setSaleModalOpen(false)}
        title="Point-of-Sale Register Checkout"
      >
        {breads.length === 0 ? (
          <div className="p-4 text-center select-none text-zinc-400 text-xs font-semibold">
            Please configure at least one active bread in the Catalog first!
          </div>
        ) : breads.filter(b => b.isActive).length === 0 ? (
          <div className="p-4 text-center select-none text-zinc-405 text-xs font-semibold">
            All bread lines are currently in draft or discontinued status. Please activate some products!
          </div>
        ) : (
          <SalesForm
            breads={breads}
            onSubmit={handleCreateSale}
          />
        )}
      </Modal>

      {/* void check warning */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Void Sales Record"
        message={`Warning! Are you sure you want to void transacted value: ${deleteDetail}? Stock levels will be automatically refunded.`}
      />
    </div>
  );
};

export default SalesPage;
