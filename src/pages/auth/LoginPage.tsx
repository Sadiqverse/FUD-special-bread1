/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { ChefHat, Chrome, ShieldAlert, Key } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signInWithGoogle, updateUserRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setErrorMsg('Login failed. Please confirm Google popup is allowed in this tab.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Demo bypass: creates a mock user inside LocalStorage and sets state
  const handleSandboxBypass = async () => {
    setLoading(true);
    // Mimic quick authentication mount sequence
    setTimeout(async () => {
      // Direct sign-in with default fake account credentials inside authentication singletons
      const { auth, db } = await import('../../firebase/config');
      const { signInAnonymously } = await import('firebase/auth');
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.warn('Anonymous Cloud Auth bypassed. Setting local team session instead.');
        // Local trigger fallback occurs directly in AuthContext state
        // By changing roles we force the profile creation in state
        await updateUserRole('Admin');
      } finally {
        setLoading(false);
      }
    }, 450);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 select-none relative font-sans">
      {/* Background radial glows */}
      <div className="absolute right-1/4 top-1/4 h-72 w-72 bg-amber-500/10 dark:bg-amber-600/5 blur-3xl rounded-full" />
      <div className="absolute left-1/4 bottom-1/4 h-72 w-72 bg-emerald-500/10 dark:bg-emerald-600/5 blur-3xl rounded-full" />

      <Card className="max-w-md w-full p-8 border border-zinc-100 dark:border-zinc-805 bg-white dark:bg-zinc-900 shadow-2xl relative z-10 flex flex-col items-center">
        {/* Logo Shield */}
        <div className="p-3 bg-amber-600 text-white rounded-2xl shadow-xl flex items-center justify-center mb-5 animate-bounce-slow">
          <ChefHat className="h-9 w-9 fill-current" />
        </div>

        {/* Headings */}
        <div className="text-center flex flex-col gap-1 mb-8">
          <h2 className="text-xl sm:text-2xl font-black font-sans tracking-tight text-zinc-900 dark:text-zinc-50">
            Bakehouse Portal
          </h2>
          <span className="text-xs text-zinc-400 max-w-xs leading-normal">
            Secure Point-of-Sale registers and baking batch control dashboard.
          </span>
        </div>

        {errorMsg && (
          <div className="w-full p-3.5 bg-red-50 dark:bg-red-955 border border-red-100 rounded-lg text-xs font-semibold text-red-650 dark:text-red-400 mb-5 leading-normal flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Log In Core Actions */}
        <div className="w-full flex flex-col gap-3.5">
          <Button
            variant="primary"
            onClick={handleGoogleLogin}
            isLoading={loading}
            className="w-full py-2.5 font-bold shadow-md relative"
            icon={<Chrome className="h-4.5 w-4.5 fill-current" />}
          >
            Sign In with Google
          </Button>

          <div className="relative flex py-2 items-center text-zinc-350 dark:text-zinc-650">
            <div className="flex-grow border-t border-zinc-150 dark:border-zinc-801" />
            <span className="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-widest font-mono">Evaluation sandbox</span>
            <div className="flex-grow border-t border-zinc-150 dark:border-zinc-801" />
          </div>

          <Button
            variant="secondary"
            onClick={handleSandboxBypass}
            disabled={loading}
            className="w-full py-2.5 font-bold dark:bg-zinc-800 hover:bg-zinc-200"
            icon={<Key className="h-4.5 w-4.5" />}
          >
            Launch Demo Playground
          </Button>
        </div>

        <div className="text-[10px] text-zinc-400 mt-8 font-mono text-center">
          Authorized team members only. Activity is audited.
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
