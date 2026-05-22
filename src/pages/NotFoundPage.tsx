/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Button from '../components/ui/Button';
import { ChefHat, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center p-8 select-none font-sans">
      <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-955/20 border border-amber-100 dark:border-amber-900/30 text-amber-600 rounded-full animate-pulse shadow-sm">
        <ChefHat className="h-10 w-10 fill-current" />
      </div>
      <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 mb-1 tracking-tight">
        Workspace Tab Not Found
      </h2>
      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-6 leading-relaxed">
        The workspace console you are trying to visit does not exist or has been shifted in directory configuration.
      </p>
      <Button
        variant="primary"
        onClick={() => window.history.back()}
        icon={<ArrowLeft className="h-4 w-4" />}
      >
        Return to Safety
      </Button>
    </div>
  );
};

export default NotFoundPage;
