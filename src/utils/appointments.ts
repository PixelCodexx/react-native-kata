import { request } from "./http";
import type { Appointment, BookingConfirmation, BookingRequest } from "./types";

// The app deliberately never calls `GET /appointments`: it returns booked
// slots with other customers' names and emails. The per-service endpoint
// returns unbooked slots only, which carry no customer data.

/** Unbooked appointments for one service. Fails intermittently by design. */
export const getServiceAppointments = (serviceId: number) =>
  request<Appointment[]>(`/appointments/${encodeURIComponent(serviceId)}`);

export const bookAppointment = (id: string, body: BookingRequest) =>
  request<BookingConfirmation>(`/appointments/book/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
