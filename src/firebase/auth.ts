/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from './config';

// Primary Sign-in provider
const googleProvider = new GoogleAuthProvider();
// Force account selection screen on popup
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Triggers popup authentication using Google Sign-In
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Login Popup Error:', error);
    throw error;
  }
}

/**
 * Log out current authenticated session
 */
export async function logOut(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout Service Error:', error);
    throw error;
  }
}
