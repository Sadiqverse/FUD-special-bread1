/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useData } from '../context/DataContext';

export function useBread() {
  const { breads, loading, addBread, updateBread, deleteBread, seedDemoData } = useData();
  return { breads, loading, addBread, updateBread, deleteBread, seedDemoData };
}

export default useBread;
