import type { Appointment, BookingConfirmation, Service } from "@utils/types";

/** Fixed clock for tests: Tuesday, 3 November 2026, 12:00 UTC. */
export const NOW = new Date("2026-11-03T12:00:00.000Z");

export const hoursFromNow = (hours: number) => new Date(NOW.getTime() + hours * 3600_000).toISOString();

export const services: Service[] = [
  { id: 1, name: "Synthetic Oil Change", duration: 1800 },
  { id: 2, name: "Brake Inspection", duration: 1800 },
  { id: 3, name: "Tire Rotation & Inspection", duration: 3600 },
  { id: 4, name: "Express Auto Detailing", duration: 5400 },
];

export const appointment = (overrides: Partial<Appointment> = {}): Appointment => ({
  id: "appt-1",
  serviceName: "Synthetic Oil Change",
  serviceId: 1,
  start: hoursFromNow(24),
  duration: 1800,
  booked: false,
  ...overrides,
});

export const confirmation = (overrides: Partial<BookingConfirmation> = {}): BookingConfirmation => ({
  id: "appt-1",
  serviceName: "Synthetic Oil Change",
  start: hoursFromNow(24),
  duration: 1800,
  booked: true,
  email: "jane@example.com",
  customerName: "Jane Doe",
  modelYear: 2005,
  make: "Mazda",
  model: "Miata",
  ...overrides,
});
