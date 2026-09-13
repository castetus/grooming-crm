'use client';

import { startTransition, useActionState, useId, useRef, useState, type ReactNode } from 'react';

import type { BookingSubmissionState, BookingSubmitAction } from './submission';

import { validateStep, type FieldErrors, type ValidationLabels } from './validation';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PetStep, type PetStepLabels } from './pet-step';
import { BookingStep, type BookingStepLabels } from './booking-step';
import { ContactStep, type ContactStepLabels } from './contact-step';
import { BookingSummary, type BookingDetails } from './summary';
import { defaultLocale, type Locale } from '@/lib/i18n/config';
import { FieldErrorMessages } from './field-error';
import styles from './booking-form.module.css';

export type BookingFormLabels = {
  title: string;
  summary: string;
  validation: ValidationLabels;
  steps: readonly [string, string, string];
  back: string;
  next: string;
  submit: string;
  submitting: string;
  result: Record<BookingSubmissionState['status'], string>;
  pet: PetStepLabels;
  booking: BookingStepLabels;
  contact: ContactStepLabels;
};

export type BookingFormProps = {
  labels: BookingFormLabels;
  submitAction: BookingSubmitAction;
  locale?: Locale;
  children?: readonly [ReactNode, ReactNode, ReactNode];
  className?: string;
};

export function BookingForm({ labels, submitAction, locale = defaultLocale, children, className }: BookingFormProps) {
  const [submission, formAction, pending] = useActionState<BookingSubmissionState, FormData>(
    async (_previous: BookingSubmissionState, formData: FormData): Promise<BookingSubmissionState> => {
      try {
        return await submitAction(formData);
      } catch {
        return { status: 'error' };
      }
    },
    { status: 'idle' },
  );
  const [activeStep, setActiveStep] = useState(0);
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [attempted, setAttempted] = useState(false);

  function nextStep() {
    if (!formRef.current) return;
    const nextErrors = validateStep(new FormData(formRef.current), activeStep, labels.validation);
    setErrors(nextErrors);
    setAttempted(true);
    if (Object.keys(nextErrors).length) return;
    setAttempted(false);
    setActiveStep(activeStep + 1);
  }
  const [details, setDetails] = useState<BookingDetails>({ place: 'salon' });

  function updateDetails(values: Partial<BookingDetails>) {
    if (values.date) setErrors((previous) => ({ ...previous, scheduledDate: undefined }));
    setDetails((previous) => ({ ...previous, ...values }));
  }

  if (submission.status === 'success') {
    return <p role="status" className="rounded-xl bg-action-soft p-4 text-booking-foreground">{labels.result.success}</p>;
  }

  return (
    <FieldErrorMessages.Provider value={Object.values(labels.validation)}>
    <form ref={formRef} className={styles.form} noValidate onChange={() => {
      if (attempted && formRef.current) {
        setErrors(validateStep(new FormData(formRef.current), activeStep, labels.validation));
      }
    }} onSubmit={(event) => {
      event.preventDefault();
      if (activeStep !== 2 || pending) return;
      const formData = new FormData(event.currentTarget);
      const nextErrors = validateStep(formData, 2, labels.validation);
      setErrors(nextErrors);
      setAttempted(true);
      if (Object.keys(nextErrors).length) return;
      startTransition(() => formAction(formData));
    }}>
      <fieldset disabled={pending} className="min-w-0">
        <section aria-labelledby={`${id}-title`} className={cn('w-full space-y-6 rounded-xl border bg-card p-4 text-card-foreground sm:p-6', className)}>
          <h2 id={`${id}-title`}>{labels.title}</h2>

          <ol className="grid grid-cols-3 gap-2 sm:gap-4">
            {labels.steps.map((label, index) => (
              <li key={index} aria-current={activeStep === index ? 'step' : undefined} className="flex min-w-0 flex-col items-center gap-2 text-center text-sm">
                <span aria-hidden="true" className={cn('flex size-9 items-center justify-center rounded-full border', index <= activeStep ? 'border-primary bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                  {index + 1}
                </span>
                <span className={cn('break-words', activeStep === index && 'font-semibold')}>{label}</span>
              </li>
            ))}
          </ol>

          {labels.steps.map((label, index) => (
            <div key={index} hidden={activeStep !== index} aria-labelledby={`${id}-step-${index}`}>
              {children?.[index] ?? [
                <PetStep key="pet" labels={labels.pet} errors={errors} onChange={updateDetails} />,
                <BookingStep key="booking" labels={labels.booking} errors={errors} locale={locale} onChange={updateDetails} />,
                <ContactStep key="contact" labels={labels.contact} errors={errors} onMethodChange={() => setErrors((previous) => ({ ...previous, phone: undefined, telegramUsername: undefined }))} />,
              ][index]}
              {index === 2 && <BookingSummary details={details} labels={labels} locale={locale} />}
            </div>
          ))}

          <div className="flex justify-between gap-3">
            {activeStep > 0 && (
              <Button type="button" variant="outline" onClick={() => { setActiveStep(activeStep - 1); setErrors({}); setAttempted(false); }}>
                {labels.back}
              </Button>
            )}
            {activeStep < 2 && (
              <Button type="button" className="ml-auto" onClick={nextStep}>
                {labels.next}
              </Button>
            )}
            {activeStep === 2 && (
              <Button type="submit" disabled={pending}>
                {pending ? labels.submitting : labels.submit}
              </Button>
            )}
          </div>
          {submission.status !== 'idle' && <p role="alert" className="text-destructive">{labels.result[submission.status]}</p>}
        </section>
      </fieldset>
    </form>
    </FieldErrorMessages.Provider>
  );
}
