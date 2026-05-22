/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile } from '../utils/types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  updateUserRole: (role: 'Admin' | 'Baker' | 'Cashier') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sign-in and logout helper proxies
  const { signInWithGoogle, logOut } = React.useMemo(() => {
    // Dynamic import to prevent circular dependency issues
    return {
      signInWithGoogle: async () => {
        const { signInWithGoogle: authSignIn } = await import('../firebase/auth');
        await authSignIn();
      },
      logOut: async () => {
        const { logOut: authSignOut } = await import('../firebase/auth');
        await authSignOut();
        setProfile(null);
      }
    };
  }, []);

  // Update user role in state and Firestore
  const updateUserRole = async (role: 'Admin' | 'Baker' | 'Cashier') => {
    if (!user) return;
    const updatedProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Bakery Team Member',
      role,
      emailVerified: user.emailVerified,
    };
    
    setProfile(updatedProfile);
    localStorage.setItem(`bakery-role-${user.uid}`, role);

    // Attempt to persist to profile doc in Firestore if database is configured
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { role, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      // Squelch permission errors during local preview / initial setup
      console.warn('Could not persist role to Firestore, utilizing local storage:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Look up assigned role from LocalStorage (fast preview bypass) or Firestore
        let savedRole = localStorage.getItem(`bakery-role-${currentUser.uid}`) as 'Admin' | 'Baker' | 'Cashier' | null;
        
        if (!savedRole) {
          try {
            const docRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(docRef);
            if (userDoc.exists()) {
              savedRole = userDoc.data().role;
            }
          } catch (err) {
            console.warn('Error fetching profile from Firestore on boot, using fallback roles:', err);
          }
        }

        // Default role assignment
        const finalRole = savedRole || 'Admin';
        
        setProfile({
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || 'Bakery Representative',
          role: finalRole,
          emailVerified: currentUser.emailVerified,
        });

        // Sync back to local storage
        localStorage.setItem(`bakery-role-${currentUser.uid}`, finalRole);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        logOut,
        updateUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
