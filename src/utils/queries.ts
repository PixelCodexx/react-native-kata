import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookAppointment, getServiceAppointments } from "./appointments";
import { getAvailableSlots } from "./availability";
import { ApiError } from "./http";
import { getServices } from "./services";
import type { Appointment, BookingConfirmation, BookingRequest, Service } from "./types";

export const queryKeys = {
  services: ["services"] as const,
  appointments: ["appointments"] as const,
  serviceSlots: (serviceId: number) => ["appointments", "service", serviceId] as const,
  confirmation: (appointmentId: string) => ["confirmation", appointmentId] as const,
};

const serviceSlotsQuery = (serviceId: number) => ({
  queryKey: queryKeys.serviceSlots(serviceId),
  queryFn: () => getServiceAppointments(serviceId),
});

export type ServiceAvailability = {
  service: Service;
  /** Bookable slots, earliest first. */
  slots: Appointment[];
  /** Availability couldn't be loaded, even after retries. */
  failed: boolean;
};

/**
 * Every service with its bookable slots in the next two weeks, checked in
 * parallel. Services with no slots are left out; services whose check failed
 * stay in (marked `failed`) so the user can retry just those.
 */
export const useServiceAvailability = () => {
  const services = useQuery({ queryKey: queryKeys.services, queryFn: getServices });
  const slotQueries = useQueries({
    queries: (services.data ?? []).map((service) => serviceSlotsQuery(service.id)),
  });

  const now = new Date();
  const items = (services.data ?? []).flatMap((service, index): ServiceAvailability[] => {
    const query = slotQueries[index];
    if (query?.data) {
      const slots = getAvailableSlots(query.data, now);
      return slots.length ? [{ service, slots, failed: false }] : [];
    }
    return query?.isError ? [{ service, slots: [], failed: true }] : [];
  });

  const failedQueries = slotQueries.filter((query) => query.isError && !query.data);
  const allFailed = slotQueries.length > 0 && failedQueries.length === slotQueries.length;
  // A failed refresh keeps the last good data on screen; report it alongside.
  const refreshError = slotQueries.find((query) => query.isError && query.data)?.error ?? null;

  const status: "loading" | "error" | "success" =
    services.isError && !services.data
      ? "error"
      : services.isPending || slotQueries.some((query) => query.isPending)
        ? "loading"
        : allFailed
          ? "error"
          : "success";

  return {
    status,
    items,
    error: services.error ?? failedQueries[0]?.error ?? null,
    refreshError: services.data ? (services.error ?? refreshError) : null,
    /** Re-request only what failed. */
    retryFailed: () => {
      if (services.isError) void services.refetch();
      failedQueries.forEach((query) => void query.refetch());
    },
  };
};

/**
 * A single bookable appointment, looked up through its service's endpoint.
 * `null` means it's no longer offered (booked, or never existed).
 */
export const useAppointment = (serviceId: number, appointmentId: string) =>
  useQuery({
    ...serviceSlotsQuery(serviceId),
    enabled: Number.isInteger(serviceId) && serviceId > 0,
    select: (appointments: Appointment[]) =>
      appointments.find((appointment) => appointment.id === appointmentId) ?? null,
  });

export const useBookAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: BookingRequest }) => bookAppointment(id, body),
    onSuccess: (confirmation: BookingConfirmation) => {
      queryClient.setQueryData(queryKeys.confirmation(confirmation.id), confirmation);
      void queryClient.invalidateQueries({ queryKey: queryKeys.appointments });
    },
    onError: (error) => {
      // A 400 usually means our view of availability is stale (e.g. someone
      // else booked the slot), so refresh it.
      if (error instanceof ApiError && error.status === 400) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.appointments });
      }
    },
  });
};

export const isAlreadyBookedError = (error: unknown) =>
  error instanceof ApiError && error.status === 400 && /already booked/i.test(error.message);
