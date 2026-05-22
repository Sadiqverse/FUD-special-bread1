/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Production, Bread, ProductionStatus } from '../../utils/types';
import { PRODUCTION_STATUSES } from '../../utils/constants';
import { validateProduction, ValidationError } from '../../utils/validators';
import { calculateScrapRate } from '../../utils/calculations';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export interface ProductionFormProps {
  breads: Bread[];
  initialData?: Production | null;
  onSubmit: (data: Omit<Production, 'id' | 'bakerId' | 'bakerEmail' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  isLoading?: boolean;
}

export const ProductionForm: React.FC<ProductionFormProps> = ({
  breads,
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const [breadId, setBreadId] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [quantityPlanned, setQuantityPlanned] = useState('20');
  const [quantityProduced, setQuantityProduced] = useState('0');
  const [quantityScrapped, setQuantityScrapped] = useState('0');
  const [status, setStatus] = useState<ProductionStatus>('Planned');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setBreadId(initialData.breadId);
      setBatchNumber(initialData.batchNumber);
      setQuantityPlanned(initialData.quantityPlanned.toString());
      setQuantityProduced(initialData.quantityProduced.toString());
      setQuantityScrapped(initialData.quantityScrapped.toString());
      setStatus(initialData.status);
      setDate(initialData.date);
      setNotes(initialData.notes || '');
    } else {
      setBreadId(breads[0]?.id || '');
      setBatchNumber('');
      setQuantityPlanned('20');
      setQuantityProduced('0');
      setQuantityScrapped('0');
      setStatus('Planned');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setErrors({});
  }, [initialData, breads]);

  // Compute live scrap rate
  const numericProduced = parseInt(quantityProduced) || 0;
  const numericScrapped = parseInt(quantityScrapped) || 0;
  const liveScrapRate = calculateScrapRate(numericProduced, numericScrapped);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const selectedBread = breads.find((b) => b.id === breadId);
    if (!selectedBread) {
      setErrors({ breadId: 'Please select a valid bread item' });
      return;
    }

    const submission = {
      breadId,
      breadName: selectedBread.name,
      batchNumber,
      quantityPlanned: parseInt(quantityPlanned) || 0,
      quantityProduced: parseInt(quantityProduced) || 0,
      quantityScrapped: parseInt(quantityScrapped) || 0,
      status,
      date,
      notes,
    };

    const validationErrors = validateProduction(submission);

    if (validationErrors.length > 0) {
      const errMap: { [key: string]: string } = {};
      validationErrors.forEach((err) => {
        errMap[err.field] = err.message;
      });
      setErrors(errMap);
      return;
    }

    await onSubmit(submission);
  };

  const breadOptions = [
    { value: '', label: '-- Select Bread Product --' },
    ...breads.map((b) => ({
      value: b.id,
      label: `${b.name} (${b.category} - Stock: ${b.currentStock})`,
    })),
  ];

  const statusOptions = PRODUCTION_STATUSES.map((st) => ({
    value: st,
    label: st,
  }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Select
        label="Bread Product"
        options={breadOptions}
        value={breadId}
        onChange={(e) => setBreadId(e.target.value)}
        error={errors.breadId}
        disabled={!!initialData} // Lock product choice once batch is saved
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Batch Reference Code"
          placeholder="Leave blank to generate auto-code"
          value={batchNumber}
          onChange={(e) => setBatchNumber(e.target.value)}
          error={errors.batchNumber}
          disabled={!!initialData}
          helperText="Unique baking batch tracker ID"
        />
        <Input
          label="Baking Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={errors.date}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Planned Quantity"
          type="number"
          placeholder="e.g. 25"
          value={quantityPlanned}
          onChange={(e) => setQuantityPlanned(e.target.value)}
          error={errors.quantityPlanned}
        />
        <Select
          label="Baking Status"
          options={statusOptions}
          value={status}
          onChange={(e) => setStatus(e.target.value as ProductionStatus)}
        />
      </div>

      {status === 'Completed' && (
        <div className="p-4 bg-amber-50/20 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-xl flex flex-col gap-4">
          <SectionTitle title="Successful Output Logs" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Actual Quantity Baked (Good)"
              type="number"
              placeholder="0"
              value={quantityProduced}
              onChange={(e) => setQuantityProduced(e.target.value)}
              error={errors.quantityProduced}
              helperText="Items successfully loaded into shelf"
            />
            <Input
              label="Scrapped Quantity (Damaged/Burned)"
              type="number"
              placeholder="0"
              value={quantityScrapped}
              onChange={(e) => setQuantityScrapped(e.target.value)}
              error={errors.quantityScrapped}
              helperText="Damaged during mold or oven runs"
            />
          </div>

          {(numericProduced > 0 || numericScrapped > 0) && (
            <div className="flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-805/85 px-3 py-2 rounded-lg text-xs select-none">
              <span className="text-zinc-500 font-medium font-mono">Waste calculation:</span>
              <div className="flex gap-2.5 items-center">
                <span className="text-zinc-500 font-medium">
                  Total baked: <strong className="text-zinc-850 dark:text-zinc-200">{numericProduced + numericScrapped}</strong> units
                </span>
                <Badge variant={liveScrapRate > 15 ? 'danger' : liveScrapRate > 5 ? 'primary' : 'success'}>
                  {liveScrapRate.toFixed(1)}% Scrap Rate
                </Badge>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="w-full flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-zinc-650 dark:text-zinc-400 select-none">
          Baker Observations & Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., Oven hot-spots on left side, dough rose perfectly during proofing step..."
          rows={3}
          className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm rounded-lg shadow-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400"
        />
      </div>

      <div className="flex justify-end gap-2.5 pt-2">
        <Button variant="primary" type="submit" isLoading={isLoading} className="w-full sm:w-auto cursor-pointer">
          {initialData ? 'Save Log' : 'Log Batch Run'}
        </Button>
      </div>
    </form>
  );
};

export default ProductionForm;

// Sourced helper from sub-component to prevent import limits
function SectionTitle({ title }: { title: string }) {
  return <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">{title}</h4>;
}
