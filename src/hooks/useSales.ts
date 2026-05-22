/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useData } from '../context/DataContext';

export function useSales() {
  const { sales, loading, addSale, deleteSale } = useData();
  return { sales, loading, addSale, deleteSale };
}

export default useSales;
