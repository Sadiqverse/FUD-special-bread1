/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sale, Bread, PaymentMethod } from '../../utils/types';
import { PAYMENT_METHODS } from '../../utils/constants';
import { validateSale, ValidationError } from '../../utils/validators';
import { formatCurrency } from '../../utils/helpers';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Minus, Plus, ShoppingCart } from 'lucide-react';

export interface SalesFormProps {
  breads: Bread[];
  onSubmit: (data: Omit<Sale, 'id' | 'soldById' | 'soldByEmail' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  isLoading?: boolean;
}

export const SalesForm: React.FC<SalesFormProps> = ({
  breads,
  onSubmit,
  isLoading = false,
}) => {
  const [breadId, setBreadId] = useState('');
  const [quantitySold, setQuantitySold] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const activeCatalog = breads.filter((b) => b.isActive);

  useEffect(() => {
    if (activeCatalog.length > 0) {
      setBreadId(activeCatalog[0].id);
    } else {
      setBreadId('');
    }
    setQuantitySold(1);
    setPaymentMethod('Cash');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setErrors({});
  }, [breads]);

  const selectedBread = activeCatalog.find((b) => b.id === breadId);
  const currentStock = selectedBread?.currentStock || 0;
  const unitPrice = selectedBread?.price || 0;
  const totalAmount = quantitySold * unitPrice;

  const handleQtyChange = (val: number) => {
    const finalQty = Math.max(1, val);
    setQuantitySold(finalQty);
    
    if (finalQty > currentStock) {
      setErrors((prev) => ({
        ...prev,
        quantitySold: `Limited Stock! Only ${currentStock} units available.`,
      }));
    } else {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.quantitySold;
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!selectedBread) {
      setErrors({ breadId: 'Please select a valid bread item' });
      return;
    }

    const submission = {
      breadId,
      breadName: selectedBread.name,
      quantitySold,
      pricePerUnit: unitPrice,
      totalAmount,
      paymentMethod,
      date,
      notes,
    };

    const validationErrors = validateSale({
      ...submission,
      currentStock,
    });

    if (validationErrors.length > 0) {
      const errMap: { [key: string]: string } = {};
      validationErrors.forEach((err) => {
        errMap[err.field] = err.message;
      });
      setErrors(errMap);
      return;
    }

    await onSubmit(submission);
    
    // Reset checkout count
    setQuantitySold(1);
    setNotes('');
  };

  const breadOptions = [
    { value: '', label: '-- Choose Product --' },
    ...activeCatalog.map((b) => ({
      value: b.id,
      label: `${b.name} (${formatCurrency(b.price)} - Stock: ${b.currentStock})`,
    })),
  ];

  const paymentOptions = PAYMENT_METHODS.map((pm) => ({
    value: pm,
    label: pm,
  }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Select
        label="Bread Item"
        options={breadOptions}
        value={breadId}
        onChange={(e) => {
          setBreadId(e.target.value);
          setQuantitySold(1);
          setErrors({});
        }}
        error={errors.breadId}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Quantity click counter */}
        <div className="w-full flex flex-col gap-1.5 select-none">
          <label className="text-xs font-semibold text-zinc-650 dark:text-zinc-400">
            Quantity Checkout
          </label>
          <div className="flex gap-1 items-center">
            <button
              type="button"
              onClick={() => handleQtyChange(quantitySold - 1)}
              className="px-3.5 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-805 text-zinc-600 dark:text-zinc-350 rounded-lg shrink-0 cursor-pointer text-sm"
              disabled={quantitySold <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              min={1}
              value={quantitySold}
              onChange={(e) => handleQtyChange(parseInt(e.target.value) || 1)}
              className={`w-full text-center py-2 bg-white dark:bg-zinc-950 border text-sm rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-bold ${
                errors.quantitySold ? 'border-red-500' : 'border-zinc-250 dark:border-zinc-800'
              }`}
            />
            <button
              type="button"
              onClick={() => handleQtyChange(quantitySold + 1)}
              className="px-3.5 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-850 text-zinc-605 dark:text-zinc-350 rounded-lg shrink-0 cursor-pointer text-sm"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {errors.quantitySold && (
            <span className="text-xs font-semibold text-red-500">{errors.quantitySold}</span>
          )}
        </div>

        <Input
          label="Transaction Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={errors.date}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Payment Gateway"
          options={paymentOptions}
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
        />
        
        {selectedBread && (
          <div className="flex flex-col gap-1 text-right select-none justify-center pt-2 sm:pt-0">
            <span className="text-xs text-zinc-500">Unit Price: {formatCurrency(unitPrice)}</span>
            <span className="text-xs text-zinc-500">Available Stock: {currentStock} loaves</span>
          </div>
        )}
      </div>

      {selectedBread && (
        <div className="p-4 bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl flex justify-between items-center select-none shadow-xs">
          <div className="flex items-center gap-2 text-emerald-705 dark:text-emerald-400">
            <ShoppingCart className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Estimated Total</span>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 font-sans leading-none">
              {formatCurrency(totalAmount)}
            </span>
            <span className="text-[10px] text-zinc-400 mt-1">
              {quantitySold} x {formatCurrency(unitPrice)}
            </span>
          </div>
        </div>
      )}

      <div className="w-full flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-zinc-650 dark:text-zinc-400 select-none">
          Checkout Comments/Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., Pre-ordered custom crust, corporate discount applied..."
          rows={2}
          className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm rounded-lg shadow-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-zinc-800 dark:text-zinc-100 placeholder-zinc-405"
        />
      </div>

      <div className="flex justify-end gap-2.5 pt-1.5">
        <Button
          variant="primary"
          type="submit"
          isLoading={isLoading}
          className="w-full cursor-pointer bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 border-none text-white font-bold"
        >
          Complete Sale
        </Button>
      </div>
    </form>
  );
};

export default SalesForm;
