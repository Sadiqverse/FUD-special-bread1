/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Bread, BreadCategory } from '../../utils/types';
import { BREAD_CATEGORIES } from '../../utils/constants';
import { validateBread, ValidationError } from '../../utils/validators';
import { calculateProfitMargin } from '../../utils/calculations';
import { formatCurrency } from '../../utils/helpers';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export interface BreadFormProps {
  initialData?: Bread | null;
  onSubmit: (data: Omit<Bread, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  isLoading?: boolean;
}

export const BreadForm: React.FC<BreadFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BreadCategory>('Sourdough');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('0.00');
  const [cost, setCost] = useState('0.00');
  const [currentStock, setCurrentStock] = useState('0');
  const [minStock, setMinStock] = useState('10');
  const [isActive, setIsActive] = useState(true);
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setSku(initialData.sku);
      setPrice(initialData.price.toFixed(2));
      setCost(initialData.cost.toFixed(2));
      setCurrentStock(initialData.currentStock.toString());
      setMinStock(initialData.minStock.toString());
      setIsActive(initialData.isActive);
    } else {
      setName('');
      setCategory('Sourdough');
      setSku('');
      setPrice('0.00');
      setCost('0.00');
      setCurrentStock('0');
      setMinStock('10');
      setIsActive(true);
    }
    setErrors({});
  }, [initialData]);

  // Compute live margin
  const numericPrice = parseFloat(price) || 0;
  const numericCost = parseFloat(cost) || 0;
  const liveMargin = calculateProfitMargin(numericPrice, numericCost);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const submission = {
      name,
      sku,
      price: parseFloat(price) || 0,
      cost: parseFloat(cost) || 0,
      currentStock: parseInt(currentStock) || 0,
      minStock: parseInt(minStock) || 0,
    };

    const validationErrors = validateBread(submission);
    
    if (validationErrors.length > 0) {
      const errMap: { [key: string]: string } = {};
      validationErrors.forEach((err) => {
        errMap[err.field] = err.message;
      });
      setErrors(errMap);
      return;
    }

    await onSubmit({
      ...submission,
      category,
      isActive,
    });
  };

  const categoryOptions = BREAD_CATEGORIES.map((cat) => ({
    value: cat,
    label: cat,
  }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="Bread Product Name"
        placeholder="e.g. Classic French Sourdough"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Category"
          options={categoryOptions}
          value={category}
          onChange={(e) => setCategory(e.target.value as BreadCategory)}
        />
        <Input
          label="SKU Code (Optional)"
          placeholder="Leave blank to generate SKU"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          helperText="Unique product barcode identifier"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Retail Price ($)"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          error={errors.price}
        />
        <Input
          label="Ingredient Cost ($)"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          error={errors.cost}
        />
      </div>

      {numericPrice > 0 && (
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg flex justify-between items-center text-xs select-none">
          <span className="text-zinc-500 font-medium">Estimated Performance:</span>
          <div className="flex gap-2.5 items-center">
            <span className="text-zinc-500 font-medium">
              Unit Profit: <strong className="text-zinc-800 dark:text-zinc-200">{formatCurrency(numericPrice - numericCost)}</strong>
            </span>
            <Badge variant={liveMargin >= 50 ? 'success' : liveMargin >= 30 ? 'primary' : 'danger'}>
              {liveMargin.toFixed(0)}% Margin
            </Badge>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Current Stock Count"
          type="number"
          placeholder="0"
          value={currentStock}
          onChange={(e) => setCurrentStock(e.target.value)}
          error={errors.currentStock}
          disabled={!!initialData} // Stock increases should be tracked via Production runs!
          helperText={initialData ? "Adjust stock counts by listing production runs." : "Starting counting count."}
        />
        <Input
          label="Low Stock Threshold"
          type="number"
          placeholder="10"
          value={minStock}
          onChange={(e) => setMinStock(e.target.value)}
          error={errors.minStock}
          helperText="Triggers email/UI visual alert if remaining level drops below this count."
        />
      </div>

      <div className="flex items-center gap-2 mt-1 py-1 px-1 text-xs sm:text-sm select-none">
        <input
          id="bread-active-input"
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-zinc-300 rounded cursor-pointer"
        />
        <label htmlFor="bread-active-input" className="text-zinc-700 dark:text-zinc-350 cursor-pointer">
          Active product in rotation (disable if discontinued)
        </label>
      </div>

      <div className="flex justify-end gap-2.5 pt-2">
        <Button variant="primary" type="submit" isLoading={isLoading} className="w-full sm:w-auto cursor-pointer">
          {initialData ? 'Save Changes' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
};

export default BreadForm;
