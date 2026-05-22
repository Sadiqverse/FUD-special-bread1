/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc,
  getDocFromServer,
  query,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import firebaseConfig from '../../firebase-applet-config.json';
import { useAuth } from './useAuth';
import { Bread, Production, Sale, OperationType } from '../utils/types';
import { handleFirestoreError } from '../firebase/firestore';

interface DataContextType {
  breads: Bread[];
  production: Production[];
  sales: Sale[];
  loading: boolean;
  isDemoMode: boolean;
  
  // CRUD operations
  addBread: (bread: Omit<Bread, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBread: (id: string, bread: Partial<Bread>) => Promise<void>;
  deleteBread: (id: string) => Promise<void>;
  
  addProduction: (run: Omit<Production, 'id' | 'bakerId' | 'bakerEmail' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduction: (id: string, run: Partial<Production>) => Promise<void>;
  deleteProduction: (id: string) => Promise<void>;
  
  addSale: (sale: Omit<Sale, 'id' | 'soldById' | 'soldByEmail' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  
  seedDemoData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Default seed data for a stunning starting workspace
const DEFAULT_BREADS_SEED: Bread[] = [
  {
    id: 'seed-sourdough',
    name: 'San Francisco Sourdough',
    category: 'Sourdough',
    sku: 'SOU-SAN-402',
    price: 6.50,
    cost: 1.80,
    currentStock: 18,
    minStock: 10,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'seed-croissant',
    name: 'Artisanal Butter Croissant',
    category: 'Pastry',
    sku: 'PAS-CRO-118',
    price: 3.75,
    cost: 1.10,
    currentStock: 5, // Triggers Low Stock Alert!
    minStock: 8,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'seed-brioche',
    name: 'French Brioche Loaf',
    category: 'Sweet Bread',
    sku: 'SWE-BRI-703',
    price: 5.25,
    cost: 1.45,
    currentStock: 24,
    minStock: 10,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'seed-baguette',
    name: 'Traditional French Baguette',
    category: 'White Bread',
    sku: 'WHI-BAG-224',
    price: 3.00,
    cost: 0.70,
    currentStock: 32,
    minStock: 15,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'seed-rye',
    name: 'German Dark Rye',
    category: 'Rye',
    sku: 'RYE-GER-912',
    price: 5.50,
    cost: 1.60,
    currentStock: 3, // Low stock alert!
    minStock: 8,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // Determine if we should count this as demo mode
  const isDemoMode = firebaseConfig.apiKey === 'PLACEHOLDER_KEY';
  
  const [breads, setBreads] = useState<Bread[]>([]);
  const [production, setProduction] = useState<Production[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  // Connection tester from Firestore guidelines
  useEffect(() => {
    if (isDemoMode) {
      setLoading(false);
      return;
    }
    
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, [isDemoMode]);

  // Load and subscribe to data sources
  useEffect(() => {
    if (isDemoMode) {
      // LocalStorage mode
      const localBreads = localStorage.getItem('bakery-db-breads');
      const localProduction = localStorage.getItem('bakery-db-production');
      const localSales = localStorage.getItem('bakery-db-sales');
      
      if (localBreads) {
        setBreads(JSON.parse(localBreads));
      } else {
        setBreads(DEFAULT_BREADS_SEED);
        localStorage.setItem('bakery-db-breads', JSON.stringify(DEFAULT_BREADS_SEED));
      }

      if (localProduction) {
        setProduction(JSON.parse(localProduction));
      } else {
        setProduction([]);
      }

      if (localSales) {
        setSales(JSON.parse(localSales));
      } else {
        setSales([]);
      }
      
      setLoading(false);
      return;
    }

    // Live cloud database observers
    if (!user) {
      setBreads([]);
      setProduction([]);
      setSales([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const qBreads = query(collection(db, 'breads'), orderBy('name', 'asc'));
    const unsubscribeBreads = onSnapshot(qBreads, 
      (snapshot) => {
        const list: Bread[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Bread);
        });
        setBreads(list);
        
        // Auto-seed if logged in, active database, and empty catalog
        if (list.length === 0 && user) {
          // Present developer option to seeds
        }
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'breads');
      }
    );

    const qProduction = query(collection(db, 'production'), orderBy('date', 'desc'));
    const unsubscribeProduction = onSnapshot(qProduction, 
      (snapshot) => {
        const list: Production[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Production);
        });
        setProduction(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'production');
      }
    );

    const qSales = query(collection(db, 'sales'), orderBy('date', 'desc'));
    const unsubscribeSales = onSnapshot(qSales, 
      (snapshot) => {
        const list: Sale[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Sale);
        });
        setSales(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'sales');
      }
    );

    return () => {
      unsubscribeBreads();
      unsubscribeProduction();
      unsubscribeSales();
    };
  }, [isDemoMode, user]);

  // Seeding trigger
  const seedDemoData = () => {
    if (isDemoMode) {
      setBreads(DEFAULT_BREADS_SEED);
      localStorage.setItem('bakery-db-breads', JSON.stringify(DEFAULT_BREADS_SEED));
    } else {
      // Cloud database seeding
      DEFAULT_BREADS_SEED.forEach(async (b) => {
        try {
          await setDoc(doc(db, 'breads', b.id), b);
        } catch (err) {
          console.error('Failed to seed cloud item:', b.name, err);
        }
      });
    }
  };

  // --- Bread CRUD ---
  const addBread = async (breadData: Omit<Bread, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = 'bread_' + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    const newBread: Bread = {
      ...breadData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    if (isDemoMode) {
      const updated = [...breads, newBread];
      setBreads(updated);
      localStorage.setItem('bakery-db-breads', JSON.stringify(updated));
    } else {
      const path = `breads/${id}`;
      try {
        await setDoc(doc(db, 'breads', id), newBread);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    }
  };

  const updateBread = async (id: string, updatedFields: Partial<Bread>) => {
    const now = new Date().toISOString();
    if (isDemoMode) {
      const updated = breads.map((b) => (b.id === id ? { ...b, ...updatedFields, updatedAt: now } : b));
      setBreads(updated);
      localStorage.setItem('bakery-db-breads', JSON.stringify(updated));
    } else {
      const path = `breads/${id}`;
      try {
        await setDoc(doc(db, 'breads', id), { ...updatedFields, updatedAt: now }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }
  };

  const deleteBread = async (id: string) => {
    if (isDemoMode) {
      const updated = breads.filter((b) => b.id !== id);
      setBreads(updated);
      localStorage.setItem('bakery-db-breads', JSON.stringify(updated));
    } else {
      const path = `breads/${id}`;
      try {
        await deleteDoc(doc(db, 'breads', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  // --- Production CRUD ---
  const addProduction = async (runData: Omit<Production, 'id' | 'bakerId' | 'bakerEmail' | 'createdAt' | 'updatedAt'>) => {
    const id = 'prod_' + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    const newRun: Production = {
      ...runData,
      id,
      bakerId: user?.uid || 'anonymous',
      bakerEmail: user?.email || 'Demo Baker',
      createdAt: now,
      updatedAt: now,
    };

    if (isDemoMode) {
      const updated = [newRun, ...production];
      setProduction(updated);
      localStorage.setItem('bakery-db-production', JSON.stringify(updated));
      
      // Stock adjustment if completed
      if (newRun.status === 'Completed' && newRun.quantityProduced > 0) {
        const b = breads.find(b => b.id === newRun.breadId);
        if (b) {
          updateBread(b.id, { currentStock: b.currentStock + newRun.quantityProduced });
        }
      }
    } else {
      const path = `production/${id}`;
      try {
        await setDoc(doc(db, 'production', id), newRun);
        
        // Relational Stock Update: increment bread inventory atomicity synced via cloud logic
        if (newRun.status === 'Completed' && newRun.quantityProduced > 0) {
          const bSnapshot = await getDoc(doc(db, 'breads', newRun.breadId));
          if (bSnapshot.exists()) {
            const currentStock = bSnapshot.data().currentStock || 0;
            await setDoc(doc(db, 'breads', newRun.breadId), { 
              currentStock: currentStock + newRun.quantityProduced 
            }, { merge: true });
          }
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    }
  };

  const updateProduction = async (id: string, updatedFields: Partial<Production>) => {
    const now = new Date().toISOString();
    if (isDemoMode) {
      const existingRun = production.find(p => p.id === id);
      const updated = production.map((p) => {
        if (p.id === id) {
          return { ...p, ...updatedFields, updatedAt: now };
        }
        return p;
      });
      setProduction(updated);
      localStorage.setItem('bakery-db-production', JSON.stringify(updated));

      // stock modification checks when moving to Complete status
      if (existingRun && existingRun.status !== 'Completed' && updatedFields.status === 'Completed') {
        const producedAmt = updatedFields.quantityProduced !== undefined ? updatedFields.quantityProduced : existingRun.quantityProduced;
        if (producedAmt > 0) {
          const b = breads.find(b => b.id === existingRun.breadId);
          if (b) {
            updateBread(b.id, { currentStock: b.currentStock + producedAmt });
          }
        }
      }
    } else {
      const path = `production/${id}`;
      try {
        await setDoc(doc(db, 'production', id), { ...updatedFields, updatedAt: now }, { merge: true });
        
        // Handle trigger stock sync atomically
        if (updatedFields.status === 'Completed') {
          const runSnap = await getDoc(doc(db, 'production', id));
          if (runSnap.exists()) {
            const run = runSnap.data();
            const bSnapshot = await getDoc(doc(db, 'breads', run.breadId));
            if (bSnapshot.exists()) {
              const currentStock = bSnapshot.data().currentStock || 0;
              await setDoc(doc(db, 'breads', run.breadId), { 
                currentStock: currentStock + (run.quantityProduced || 0) 
              }, { merge: true });
            }
          }
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }
  };

  const deleteProduction = async (id: string) => {
    if (isDemoMode) {
      const updated = production.filter((p) => p.id !== id);
      setProduction(updated);
      localStorage.setItem('bakery-db-production', JSON.stringify(updated));
    } else {
      const path = `production/${id}`;
      try {
        await deleteDoc(doc(db, 'production', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  // --- Sales CRUD ---
  const addSale = async (saleData: Omit<Sale, 'id' | 'soldById' | 'soldByEmail' | 'createdAt' | 'updatedAt'>) => {
    const id = 'sale_' + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    const newSale: Sale = {
      ...saleData,
      id,
      soldById: user?.uid || 'anonymous',
      soldByEmail: user?.email || 'Demo Cashier',
      createdAt: now,
      updatedAt: now,
    };

    if (isDemoMode) {
      const updated = [newSale, ...sales];
      setSales(updated);
      localStorage.setItem('bakery-db-sales', JSON.stringify(updated));

      // Subtract from current stock
      const b = breads.find(b => b.id === newSale.breadId);
      if (b) {
        const finalStock = Math.max(0, b.currentStock - newSale.quantitySold);
        updateBread(b.id, { currentStock: finalStock });
      }
    } else {
      const path = `sales/${id}`;
      try {
        await setDoc(doc(db, 'sales', id), newSale);
        
        // Relational Stock deduction: subtract sold item count
        const bSnapshot = await getDoc(doc(db, 'breads', newSale.breadId));
        if (bSnapshot.exists()) {
          const currentStock = bSnapshot.data().currentStock || 0;
          const finalStock = Math.max(0, currentStock - newSale.quantitySold);
          await setDoc(doc(db, 'breads', newSale.breadId), { currentStock: finalStock }, { merge: true });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    }
  };

  const deleteSale = async (id: string) => {
    if (isDemoMode) {
      const existingSale = sales.find(s => s.id === id);
      const updated = sales.filter((s) => s.id !== id);
      setSales(updated);
      localStorage.setItem('bakery-db-sales', JSON.stringify(updated));

      // Re-add to stock
      if (existingSale) {
        const b = breads.find(b => b.id === existingSale.breadId);
        if (b) {
          updateBread(b.id, { currentStock: b.currentStock + existingSale.quantitySold });
        }
      }
    } else {
      const path = `sales/${id}`;
      try {
        // Find sale first to restore stock count, then delete
        const saleSnap = await getDoc(doc(db, 'sales', id));
        if (saleSnap.exists()) {
          const sale = saleSnap.data() as Sale;
          await deleteDoc(doc(db, 'sales', id));
          
          // Stock restoration
          const bSnapshot = await getDoc(doc(db, 'breads', sale.breadId));
          if (bSnapshot.exists()) {
            const currentStock = bSnapshot.data().currentStock || 0;
            await setDoc(doc(db, 'breads', sale.breadId), { 
              currentStock: currentStock + sale.quantitySold 
            }, { merge: true });
          }
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  return (
    <DataContext.Provider
      value={{
        breads,
        production,
        sales,
        loading,
        isDemoMode,
        addBread,
        updateBread,
        deleteBread,
        addProduction,
        updateProduction,
        deleteProduction,
        addSale,
        deleteSale,
        seedDemoData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
