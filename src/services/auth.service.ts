/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile } from '../utils/types';

/**
 * Service for managing user authentication profiles in Firestore.
 */
export const AuthService = {
  /**
   * Fetches user profile roles from DB
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          uid,
          ...docSnap.data(),
        } as UserProfile;
      }
      return null;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return null;
    }
  },

  /**
   * Registers/Updates teammate profiles in database
   */
  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      const docRef = doc(db, 'users', profile.uid);
      await setDoc(docRef, {
        email: profile.email,
        displayName: profile.displayName,
        role: profile.role,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.error('Error saving user profile:', err);
    }
  }
};
