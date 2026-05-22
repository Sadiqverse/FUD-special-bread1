/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useProduction } from '../../hooks/useProduction';
import { useBread } from '../../hooks/useBread';
import { useAuth } from '../../hooks/useAuth';
import { Production, ProductionStatus } from '../../utils/types';
import { PRODUCTION_STATUSES } from '../../utils/constants';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ProductionForm from '../../components/forms/ProductionForm';
import ProductionTable from '../../components/tables/ProductionTable';
import { Plus, ChefHat, Calendar, Trash2, ShieldAlert } from 'lucide-react';

export const ProductionPage: React.FC = () => {
  const { profile } = useAuth();
  const { breads } = useBread();
  const { production, addProduction, updateProduction, deleteProduction } = useProduction();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeRun, setActiveRun] = useState<Production | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteBatch, setDeleteBatch] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const canEdit = profile?.role === 'Admin' || profile?.role === 'Baker';

  const handleCreateOrUpdate = async (formData: any) => {
    if (activeRun) {
      await updateProduction(activeRun.id, formData);
    } else {
      await addProduction(formData);
    }
    setEditModalOpen(false);
  };

  const handleStatusChange = async (id: string, status: ProductionStatus) => {
    // If transitioning simple status from inline buttons (e.g. In Progress)
    await updateProduction(id, { status } as any);
  };

  const handleDeleteTrigger = (id: string, batchNum: string) => {
    setDeleteId(id);
    setDeleteBatch(batchNum);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteProduction(deleteId);
      setDeleteConfirmOpen(false);
      setDeleteId(null);
    }
  };

  // Filter logs list
  const filteredRuns = production.filter((p) => {
    const matchesSearch = p.breadName.toLowerCase().includes(searchQuery.toLowerCase()) || p.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;
    const matchesDate = !selectedDate || p.date === selectedDate;
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Ovens & Baking Batches"
        description="Schedule daily loaves baking output, track live proofing, and record oven scrap yields."
        action={
          canEdit && (
            <Button
              variant="primary"
              onClick={() => {
                setActiveRun(null);
                setEditModalOpen(true);
              }}
              icon={<Plus className="h-4 w-4" />}
            >
              Plan Batch Run
            </Button>
          )
        }
      />

      {/* Oven filters grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-805 select-none text-xs">
        <div className="sm:col-span-1">
          <input
            type="text"
            placeholder="Search details or batch code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400"
          />
        </div>
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm focus:outline-hidden text-zinc-705 dark:text-zinc-300 font-semibold cursor-pointer font-sans"
          >
            <option value="All">All Baking Statuses</option>
            {PRODUCTION_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
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

      {filteredRuns.length === 0 ? (
        <EmptyState
          title="No Baking Batches"
          description={
            production.length === 0
              ? "The baking schedule is empty. Choose a bread product and heat up the ovens!"
              : "Try matching other search query keywords, statuses, or shift dates."
          }
          icon={<ChefHat className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />}
        />
      ) : (
        <ProductionTable
          production={filteredRuns}
          userRole={profile?.role}
          onEdit={(p) => {
            setActiveRun(p);
            setEditModalOpen(true);
          }}
          onDelete={handleDeleteTrigger}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Form editing dialog */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={activeRun ? `Log Batch Run Details: ${activeRun.batchNumber}` : 'Plan Master Baking Batch'}
      >
        {breads.length === 0 ? (
          <div className="p-4 text-center select-none text-zinc-400 text-xs">
            Please configure at least one active bread in the Catalog first!
          </div>
        ) : (
          <ProductionForm
            breads={breads}
            initialData={activeRun}
            onSubmit={handleCreateOrUpdate}
          />
        )}
      </Modal>

      {/* Confirmation delete modal */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Void Baking Batch Log"
        message={`Confirm voiding batch tracking code: ${deleteBatch}? Stock count integrations will be re-calculated.`}
      />
    </div>
  );
};

export default ProductionPage;
