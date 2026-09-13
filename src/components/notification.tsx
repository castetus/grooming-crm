'use client';

import { createPortal } from 'react-dom';
import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Notification({ message, success, closeLabel, onClose }: {
  message: string;
  success: boolean;
  closeLabel: string;
  onClose: () => void;
}) {
  return createPortal(
    <div className={cn(
      'fixed inset-x-4 bottom-4 z-50 flex items-start gap-3 rounded-xl border p-4 shadow-lg sm:left-auto sm:right-6 sm:bottom-6 sm:w-96',
      success ? 'border-action bg-action-soft text-booking-foreground' : 'border-destructive bg-popover text-popover-foreground',
    )}>
      <p role={success ? 'status' : 'alert'} className="min-w-0 flex-1 text-sm">{message}</p>
      <Button type="button" variant="ghost" size="icon" aria-label={closeLabel} onClick={onClose}>
        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
      </Button>
    </div>,
    document.body,
  );
}
