/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useData } from '../context/DataContext';

export function useProduction() {
  const { production, loading, addProduction, updateProduction, deleteProduction } = useData();
  return { production, loading, addProduction, updateProduction, deleteProduction };
}

export default useProduction;
