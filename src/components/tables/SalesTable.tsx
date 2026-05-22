/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sale } from '../../utils/types';
import { formatDate, formatCurrency } from '../../utils/helpers';
import Table from '../ui/Table';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Pagination from '../ui/Pagination';
import { Trash2, ShoppingCart } from 'lucide-react';

export interface SalesTableProps {
  sales: Sale[];
  userRole?: string;
  onDelete: (id: string, detail: string) => void;
  itemsPerPage?: number;
}

export const SalesTable: React.FC<SalesTableProps> = ({
  sales,
  userRole = 'Admin',
  onDelete,
  itemsPerPage = 10,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(sales.length / itemsPerPage);

  const isAdmin = userRole === 'Admin';

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const paginatedSales = sales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const headers = ['Date', 'Item Description', 'Qty', 'Unit Price', 'Total Sale', 'Payment Method', 'Cashier', 'Actions'];

  return (
    <div className="flex flex-col gap-4">
      <Table headers={headers}>
        {paginatedSales.map((s) => {
          const detailStr = `${s.quantitySold}x ${s.breadName}`;
          return (
            <tr key={s.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
              <td className="px-5 py-3.5 text-xs text-zinc-500 whitespace-nowrap">
                {formatDate(s.date)}
              </td>
              <td className="px-5 py-3 font-medium text-zinc-850 dark:text-zinc-150 whitespace-nowrap">
                <div className="flex items-center gap-1.5 font-sans">
                  <div className="p-1 rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
                    <ShoppingCart className="h-3 w-3" />
                  </div>
                  {s.breadName}
                </div>
              </td>
              <td className="px-5 py-3 font-bold text-zinc-700 dark:text-zinc-300">
                {s.quantitySold}
              </td>
              <td className="px-5 py-3 text-zinc-500 font-mono text-xs whitespace-nowrap">
                {formatCurrency(s.pricePerUnit)}
              </td>
              <td className="px-5 py-3 font-extrabold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                {formatCurrency(s.totalAmount)}
              </td>
              <td className="px-5 py-3 text-xs whitespace-nowrap">
                <Badge variant={s.paymentMethod === 'Cash' ? 'success' : s.paymentMethod === 'Card' ? 'primary' : 'info'}>
                  {s.paymentMethod}
                </Badge>
              </td>
              <td className="px-5 py-3 text-xs text-zinc-500 truncate max-w-[120px]" title={s.soldByEmail}>
                {s.soldByEmail.split('@')[0]}
              </td>
              <td className="px-5 py-3 whitespace-nowrap">
                {isAdmin ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 px-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20"
                    onClick={() => onDelete(s.id, detailStr)}
                    icon={<Trash2 className="h-3.5 w-3.5" />}
                    title="Void Transaction"
                  />
                ) : (
                  <span className="text-[10px] text-zinc-300 font-medium italic">Admin locked</span>
                )}
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
        totalItems={sales.length}
      />
    </div>
  );
};

export default SalesTable;
