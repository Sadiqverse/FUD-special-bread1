/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useBread } from '../../hooks/useBread';
import { useAuth } from '../../hooks/useAuth';
import { Bread, BreadCategory } from '../../utils/types';
import { BREAD_CATEGORIES } from '../../utils/constants';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/ui/SearchBar';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import BreadForm from '../../components/forms/BreadForm';
import BreadTable from '../../components/tables/BreadTable';
import { Plus, SlidersHorizontal, Layers, Trash2, Edit2, Key } from 'lucide-react';

export const BreadPage: React.FC = () => {
  const { profile } = useAuth();
  const { breads, addBread, updateBread, deleteBread, seedDemoData } = useBread();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeBread, setActiveBread] = useState<Bread | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const isAdmin = profile?.role === 'Admin';

  const handleCreateOrUpdate = async (formData: any) => {
    if (activeBread) {
      await updateBread(activeBread.id, formData);
    } else {
      await addBread(formData);
    }
    setEditModalOpen(false);
  };

  const handleDeleteTrigger = (id: string, name: string) => {
    setDeleteId(id);
    setDeleteName(name);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteBread(deleteId);
      setDeleteConfirmOpen(false);
      setDeleteId(null);
    }
  };

  // Catalog filtered list
  const filteredBreads = breads.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Bakehouse Product Catalog"
        description="Configure unit retail prices, standard ingredient costs, and check low stock warning limits."
        action={
          isAdmin && (
            <Button
              variant="primary"
              onClick={() => {
                setActiveBread(null);
                setEditModalOpen(true);
              }}
              icon={<Plus className="h-4 w-4" />}
            >
              Add Product
            </Button>
          )
        }
      />

      {/* Searching filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-805 select-none text-xs">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by bread name or sku barcode..."
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5">
            <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-zinc-700 dark:text-zinc-300 font-semibold outline-hidden pr-2 cursor-pointer font-sans"
            >
              <option value="All">All Categories</option>
              {BREAD_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredBreads.length === 0 ? (
        <EmptyState
          title="No Products Found"
          description={
            breads.length === 0
              ? 'Your bakery product list is currently blank! Click below to seed some delightful default baking products.'
              : 'Try matching other search query keywords or filter categories.'
          }
          actionLabel={breads.length === 0 ? 'Seed Sandbox Catalog' : undefined}
          onAction={breads.length === 0 ? seedDemoData : undefined}
          icon={<Layers className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />}
        />
      ) : (
        <BreadTable
          breads={filteredBreads}
          userRole={profile?.role}
          onEdit={(b) => {
            setActiveBread(b);
            setEditModalOpen(true);
          }}
          onDelete={handleDeleteTrigger}
        />
      )}

      {/* Editing dialog */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={activeBread ? (isAdmin ? `Edit Product: ${activeBread.name}` : `View details: ${activeBread.name}`) : 'Add New Product'}
      >
        {(!isAdmin && activeBread) ? (
          <div className="flex flex-col gap-4 select-none pr-1">
            <div className="px-3.5 py-3 bg-amber-50/15 dark:bg-amber-955/10 border border-amber-100 dark:border-amber-900/20 rounded-xl leading-relaxed text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2.5">
              <Key className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                You are currently viewing catalog entries in <strong>Read-Only mode</strong> because your role is set to <strong>{profile?.role}</strong>. Only <strong>Admin</strong> users can change retail details.
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs font-medium py-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-zinc-450">Name:</span>
                <span className="text-zinc-800 dark:text-zinc-100 font-bold text-sm">{activeBread.name}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-zinc-450">Category:</span>
                <span className="text-zinc-800 dark:text-zinc-100 font-bold">{activeBread.category}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-zinc-455">SKU:</span>
                <span className="text-zinc-805 font-mono">{activeBread.sku}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-zinc-455">In Stock:</span>
                <span className="text-zinc-800 dark:text-zinc-100 font-bold">{activeBread.currentStock} units</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-zinc-455">Retail Price:</span>
                <span className="text-zinc-800 dark:text-zinc-100 font-bold text-sm">${activeBread.price.toFixed(2)}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-zinc-455">Ingredient cost:</span>
                <span className="text-zinc-800 dark:text-zinc-100 font-semibold">${activeBread.cost.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>Close View</Button>
            </div>
          </div>
        ) : (
          <BreadForm
            initialData={activeBread}
            onSubmit={handleCreateOrUpdate}
          />
        )}
      </Modal>

      {/* Confirmation modal */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Bread Product"
        message={`Warning! Are you sure you want to delete ${deleteName}? This action cannot be reversed and will void associated stock records.`}
      />
    </div>
  );
};

export default BreadPage;
