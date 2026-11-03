import type { Appointment } from "./types";

export const BOOKING_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * Bookable slots: unbooked, starting after `now` and within the booking
 * window, earliest first. The mock API never prunes past slots or sorts them.
 */
export const getAvailableSlots = (appointments: Appointment[], now: Date): Appointment[] => {
  const from = now.getTime();
  const until = from + BOOKING_WINDOW_MS;

  return appointments
    .filter((appointment) => {
      const start = Date.parse(appointment.start);
      return !appointment.booked && start > from && start <= until;
    })
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
};
