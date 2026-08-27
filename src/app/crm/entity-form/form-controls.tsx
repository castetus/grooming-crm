'use client';

import type { ReactNode } from 'react';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type SearchableSelectOption = {
  label: string;
  value: string;
};

export function SearchableSelect({
  id,
  name,
  value,
  options,
  placeholder,
  emptyMessage,
  className,
  disabled = false,
  required = false,
  onValueChange,
}: {
  id: string;
  name: string;
  value: string;
  options: SearchableSelectOption[];
  placeholder: string;
  emptyMessage: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  onValueChange: (value: string) => void;
}) {
  const selectedOption = options.find((option) => option.value === value) ?? null;

  return (
    <Combobox
      items={options}
      name={name}
      value={selectedOption}
      disabled={disabled}
      required={required}
      onValueChange={(option) => onValueChange(option?.value ?? '')}
    >
      <ComboboxInput
        id={id}
        className={cn('w-full', className)}
        placeholder={placeholder}
        disabled={disabled}
        showClear
      />
      <ComboboxContent>
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
        <ComboboxList>
          {(option: SearchableSelectOption) => (
            <ComboboxItem key={option.value} value={option}>
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export function FormField({
  id,
  label,
  required = false,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className='space-y-2'>
      <Label htmlFor={id}>
        {label}
        {required && <span className='text-destructive'> *</span>}
      </Label>
      {children}
    </div>
  );
}

export function Select({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      className={cn(
        'h-9 w-full rounded-xl border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:bg-muted/50 disabled:opacity-50 dark:bg-white dark:text-black dark:disabled:bg-muted/50 dark:disabled:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'min-h-24 w-full resize-y rounded-xl border border-input bg-white px-3 py-2 text-sm outline-none placeholder:text-muted-foreground read-only:bg-muted/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:bg-muted/50 disabled:opacity-50 dark:bg-white dark:text-black dark:read-only:bg-muted/50 dark:read-only:text-foreground dark:disabled:bg-muted/50 dark:disabled:text-foreground',
        className,
      )}
      {...props}
    />
  );
}
