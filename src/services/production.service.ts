/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Production } from '../utils/types';
import { generateBatchNumber } from '../utils/helpers';
import { calculateScrapRate } from '../utils/calculations';

export const ProductionService = {
  /**
   * Initializes a new Production Run template
   */
  createProductionTemplate(fields: {
    breadId: string;
    breadName: string;
    quantityPlanned: number;
    quantityProduced: number;
    quantityScrapped: number;
    status: Production['status'];
    date: string;
    notes: string;
  }): Omit<Production, 'id' | 'bakerId' | 'bakerEmail' | 'createdAt' | 'updatedAt'> {
    const batchNumber = generateBatchNumber();
    return {
      breadId: fields.breadId,
      breadName: fields.breadName,
      batchNumber,
      quantityPlanned: Number(fields.quantityPlanned),
      quantityProduced: Number(fields.quantityProduced),
      quantityScrapped: Number(fields.quantityScrapped),
      status: fields.status,
      date: fields.date,
      notes: fields.notes,
    };
  },

  /**
   * Filters batch list by a specific status
   */
  filterByStatus(runs: Production[], status: Production['status']): Production[] {
    return runs.filter((p) => p.status === status);
  },

  /**
   * Summarizes total wasted flour/dough cost based on scrapped counts
   */
  getBatchLossEstimation(run: Production, costPerUnit: number): number {
    return run.quantityScrapped * costPerUnit;
  },

  /**
   * Identifies bakers with high efficiency or waste reports
   */
  getHighScrapRuns(runs: Production[], thresholdPercent: number = 10): Production[] {
    return runs.filter((r) => {
      const rate = calculateScrapRate(r.quantityProduced, r.quantityScrapped);
      return rate > thresholdPercent;
    });
  }
};
