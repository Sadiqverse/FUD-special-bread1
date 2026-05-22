/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bread } from '../../utils/types';
import { isLowStock } from '../../utils/calculations';
import { formatCurrency } from '../../utils/helpers';
import Table from '../ui/Table';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Pagination from '../ui/Pagination';
import { Edit2, Trash2, ShieldAlert } from 'lucide-react';

export interface BreadTableProps {
  breads: Bread[];
  userRole?: string;
  onEdit: (bread: Bread) => void;
  onDelete: (id: string, name: string) => void;
  itemsPerPage?: number;
}

export const BreadTable: React.FC<BreadTableProps> = ({
  breads,
  userRole = 'Admin',
  onEdit,
  onDelete,
  itemsPerPage = 10,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(breads.length / itemsPerPage);

  const isAdmin = userRole === 'Admin';

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const paginatedBreads = breads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const headers = ['SKU', 'Bread Name', 'Category', 'Price', 'Ingredient Cost', 'In Stock', 'Status', 'Actions'];

  return (
    <div className="flex flex-col gap-4">
      <Table headers={headers}>
        {paginatedBreads.map((b) => {
          const depleted = isLowStock(b);
          return (
            <tr key={b.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
              <td className="px-5 py-3 font-mono text-xs font-semibold text-zinc-500 whitespace-nowrap">
                {b.sku}
              </td>
              <td className="px-5 py-3 font-medium text-zinc-850 dark:text-zinc-150">
                {b.name}
              </td>
              <td className="px-5 py-3 text-xs whitespace-nowrap">
                <Badge variant="neutral">{b.category}</Badge>
              </td>
              <td className="px-5 py-3 font-medium text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                {formatCurrency(b.price)}
              </td>
              <td className="px-5 py-3 text-zinc-500 whitespace-nowrap">
                {formatCurrency(b.cost)}
              </td>
              <td className="px-5 py-3 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold ${depleted ? 'text-red-650' : 'text-zinc-805 dark:text-zinc-200'}`}>
                    {b.currentStock}
                  </span>
                  {depleted && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-medium bg-red-100 dark:bg-red-955 text-red-700 dark:text-red-400">
                      LOW STOCK
                    </span>
                  )}
                </div>
              </td>
              <td className="px-5 py-3 whitespace-nowrap">
                <Badge variant={b.isActive ? 'success' : 'neutral'}>
                  {b.isActive ? 'Active' : 'Discontinued'}
                </Badge>
              </td>
              <td className="px-5 py-3 whitespace-nowrap">
                <div className="flex gap-1.5 items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(b)}
                    icon={<Edit2 className="h-3.5 w-3.5" />}
                    title={isAdmin ? "Edit Details" : "View Details"}
                  >
                    {isAdmin ? "Edit" : "View"}
                  </Button>
                  
                  {isAdmin ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(b.id, b.name)}
                      className="border-red-100 hover:bg-red-50 hover:text-red-600 dark:border-red-950/20 dark:hover:bg-red-955/35! dark:hover:text-red-400!"
                      icon={<Trash2 className="h-3.5 w-3.5" />}
                    >
                      Delete
                    </Button>
                  ) : (
                    <span className="text-[10px] text-zinc-400 font-medium tracking-wide items-center justify-center font-sans hidden sm:inline-flex gap-1">
                      <ShieldAlert className="h-3 w-3" /> Locked
                    </span>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </Table>
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        totalItems={breads.length}
      />
    </div>
  );
};

export default BreadTable;
