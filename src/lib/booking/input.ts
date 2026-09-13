import type { CreatePendingAppointmentInput } from '@/types/entities';

export function bookingInput(formData: FormData, now = new Date()): CreatePendingAppointmentInput | null {
  const field = (name: string) => {
    const value = formData.get(name);
    return typeof value === 'string' ? value.trim() : '';
  };
  const clientName = field('clientName');
  const petName = field('petName');
  const species = field('species');
  const sex = field('sex');
  const place = field('locationType');
  const date = field('scheduledDate');
  // The requested time is optional; the database needs a provisional start time.
  const time = field('scheduledTime') || '13:00';
  const phone = field('phone').replace(/\s/g, '');
  const telegramUsername = field('telegramUsername').replace(/^@/, '');

  if (!clientName || !petName ||
    (species !== 'dog' && species !== 'cat') ||
    (sex !== 'male' && sex !== 'female') ||
    (place !== 'salon' && place !== 'home') ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^(1[3-9]|2[0-3]):00$/.test(time) ||
    !((/^\+[1-9]\d{6,14}$/.test(phone) && !telegramUsername) ||
      (!phone && /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(telegramUsername)))) {
    return null;
  }

  const dateFormatter = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Belgrade' });
  const probe = new Date(`${date}T12:00:00Z`);
  if (!Number.isFinite(probe.getTime()) || dateFormatter.format(probe) !== date || date <= dateFormatter.format(now)) {
    return null;
  }
  const offset = new Intl.DateTimeFormat('en', {
    timeZone: 'Europe/Belgrade', timeZoneName: 'longOffset',
  }).formatToParts(probe).find((part) => part.type === 'timeZoneName')?.value.replace('GMT', '');
  if (!offset) return null;
  const start = new Date(`${date}T${time}:00${offset}`);

  return {
    clientName,
    petName,
    species,
    sex,
    breed: field('breed') || null,
    phone: phone || null,
    telegramUsername: telegramUsername || null,
    locationType: place === 'home' ? 'mobile' : 'salon',
    scheduledStart: start.toISOString(),
    // Match the existing Telegram flow's provisional three-hour appointment.
    scheduledEnd: new Date(start.getTime() + 3 * 60 * 60 * 1000).toISOString(),
    notes: field('notes') || null,
    status: 'pending',
  };
}
