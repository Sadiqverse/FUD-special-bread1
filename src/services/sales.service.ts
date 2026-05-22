/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sale, PaymentMethod } from '../utils/types';

export const SalesService = {
  /**
   * Initializes a new Point of Sales Checkout transaction
   */
  createSaleTemplate(fields: {
    breadId: string;
    breadName: string;
    quantitySold: number;
    pricePerUnit: number;
    paymentMethod: PaymentMethod;
    date: string;
    notes: string;
  }): Omit<Sale, 'id' | 'soldById' | 'soldByEmail' | 'createdAt' | 'updatedAt'> {
    const totalAmount = Number(fields.quantitySold) * Number(fields.pricePerUnit);
    return {
      breadId: fields.breadId,
      breadName: fields.breadName,
      quantitySold: Number(fields.quantitySold),
      pricePerUnit: Number(fields.pricePerUnit),
      totalAmount,
      paymentMethod: fields.paymentMethod,
      date: fields.date,
      notes: fields.notes,
    };
  },

  /**
   * Summarizes total sale counts and proceeds by payment medium
   */
  getPaymentMethodShares(sales: Sale[]): { [key in PaymentMethod]: { count: number; value: number } } {
    const summary: { [key in PaymentMethod]: { count: number; value: number } } = {
      Cash: { count: 0, value: 0 },
      Card: { count: 0, value: 0 },
      Mobile: { count: 0, value: 0 },
    };

    sales.forEach((s) => {
      if (summary[s.paymentMethod]) {
        summary[s.paymentMethod].count += 1;
        summary[s.paymentMethod].value += s.totalAmount;
      }
    });

    return summary;
  }
};
