export type BookingSubmissionState = {
  status: 'idle' | 'success' | 'invalid' | 'error';
};

export type BookingSubmitAction = (formData: FormData) => Promise<BookingSubmissionState>;
