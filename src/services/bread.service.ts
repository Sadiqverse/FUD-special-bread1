/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Bread } from '../utils/types';
import { generateSKU } from '../utils/helpers';
import { calculateProfitMargin } from '../utils/calculations';

export const BreadService = {
  /**
   * Builds a new valid Bread model
   */
  createBreadTemplate(fields: {
    name: string;
    category: Bread['category'];
    price: number;
    cost: number;
    currentStock: number;
    minStock: number;
  }): Omit<Bread, 'id' | 'createdAt' | 'updatedAt'> {
    const sku = generateSKU(fields.name, fields.category);
    return {
      name: fields.name,
      category: fields.category,
      sku,
      price: Number(fields.price),
      cost: Number(fields.cost),
      currentStock: Number(fields.currentStock),
      minStock: Number(fields.minStock),
      isActive: true,
    };
  },

  /**
   * Highlights items with margins below standard threshold
   */
  getLowMarginItems(breads: Bread[], limitPercent: number = 30): Bread[] {
    return breads.filter((b) => {
      const margin = calculateProfitMargin(b.price, b.cost);
      return margin < limitPercent;
    });
  }
};
