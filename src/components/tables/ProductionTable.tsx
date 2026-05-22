/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Production, ProductionStatus } from '../../utils/types';
import { calculateScrapRate } from '../../utils/calculations';
import { formatDate } from '../../utils/helpers';
import Table from '../ui/Table';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Pagination from '../ui/Pagination';
import { Play, CheckCircle, Edit, Trash2, HelpCircle } from 'lucide-react';

export interface ProductionTableProps {
  production: Production[];
  userRole?: string;
  onEdit: (run: Production) => void;
  onDelete: (id: string, batchNum: string) => void;
  onStatusChange: (id: string, status: ProductionStatus) => void;
  itemsPerPage?: number;
}

export const ProductionTable: React.FC<ProductionTableProps> = ({
  production,
  userRole = 'Admin',
  onEdit,
  onDelete,
  onStatusChange,
  itemsPerPage = 10,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(production.length / itemsPerPage);

  const canEdit = userRole === 'Admin' || userRole === 'Baker';

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const paginatedRuns = production.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const statusBadges: { [key in ProductionStatus]: 'primary' | 'info' | 'success' | 'danger' } = {
    Planned: 'neutral' as any,
    'In Progress': 'info',
    Completed: 'success',
    Cancelled: 'danger',
  };

  const headers = [
    'Date',
    'Batch Code',
    'Product name',
    'Planned',
    'Successful',
    'Scrapped/Loss',
    'Scrap Rate',
    'Status',
    'Actions',
  ];

  return (
    <div className="flex flex-col gap-4">
      <Table headers={headers}>
        {paginatedRuns.map((p) => {
          const scrapRate = calculateScrapRate(p.quantityProduced, p.quantityScrapped);
          
          return (
            <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-all duration-150">
              <td className="px-5 py-3.5 whitespace-nowrap text-xs font-semibold text-zinc-500">
                {formatDate(p.date)}
              </td>
              <td className="px-5 py-3 font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                {p.batchNumber}
              </td>
              <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-150">
                {p.breadName}
              </td>
              <td className="px-5 py-3 text-center sm:text-left font-semibold text-zinc-700 dark:text-zinc-300">
                {p.quantityPlanned}
              </td>
              <td className="px-5 py-3 text-center sm:text-left font-bold text-emerald-600 dark:text-emerald-400">
                {p.status === 'Completed' ? p.quantityProduced : '-'}
              </td>
              <td className="px-5 py-3 text-center sm:text-left font-bold text-red-500">
                {p.status === 'Completed' ? p.quantityScrapped : '-'}
              </td>
              <td className="px-5 py-3 whitespace-nowrap">
                {p.status === 'Completed' ? (
                  <Badge variant={scrapRate > 10 ? 'danger' : scrapRate > 3 ? 'primary' : 'success'}>
                    {scrapRate.toFixed(1)}%
                  </Badge>
                ) : (
                  <span className="text-zinc-350 dark:text-zinc-650 font-mono text-xs">-</span>
                )}
              </td>
              <td className="px-5 py-3 whitespace-nowrap">
                <Badge variant={statusBadges[p.status]}>{p.status}</Badge>
              </td>
              <td className="px-5 py-3 whitespace-nowrap">
                <div className="flex gap-2 items-center">
                  {/* Step status transitions */}
                  {canEdit && p.status === 'Planned' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStatusChange(p.id, 'In Progress')}
                      className="text-blue-600 border-blue-100 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-950/20"
                      icon={<Play className="h-3 w-3 fill-current" />}
                    >
                      Bake
                    </Button>
                  )}
                  {canEdit && p.status === 'In Progress' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(p)} // Opens form overlay where they can complete and enter output count
                      className="text-emerald-600 border-emerald-100 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-950/20"
                      icon={<CheckCircle className="h-3 w-3" />}
                    >
                      Log Output
                    </Button>
                  )}

                  {/* Standard modifications */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 px-1.5"
                    onClick={() => onEdit(p)}
                    icon={<Edit className="h-3.5 w-3.5" />}
                    title="Edit and Notes"
                  />
                  
                  {userRole === 'Admin' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 px-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20"
                      onClick={() => onDelete(p.id, p.batchNumber)}
                      icon={<Trash2 className="h-3.5 w-3.5" />}
                      title="Delete Entry"
                    />
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
        totalItems={production.length}
      />
    </div>
  );
};

export default ProductionTable;
