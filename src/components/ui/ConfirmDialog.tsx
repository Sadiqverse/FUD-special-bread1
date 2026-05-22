/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertCircle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 items-start">
          <div className={`p-2 rounded-full border shrink-0 ${
            variant === 'danger' 
              ? 'bg-red-50 text-red-650 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30' 
              : variant === 'warning'
              ? 'bg-yellow-50 text-yellow-650 border-yellow-101 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-904/30'
              : 'bg-amber-50 text-amber-650 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
          }`}>
            <AlertCircle className="h-5 w-5" />
          </div>
          <p className="text-zinc-650 dark:text-zinc-400 leading-relaxed text-xs sm:text-sm">
            {message}
          </p>
        </div>
        <div className="flex gap-2.5 justify-end mt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
