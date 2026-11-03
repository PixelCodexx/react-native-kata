export type Service = {
  id: number;
  name: string;
  /** Seconds. */
  duration: number;
};

export type Appointment = {
  id: string;
  serviceName: string;
  serviceId: number;
  /** ISO 8601. */
  start: string;
  /** Seconds. */
  duration: number;
  booked: boolean;
  email?: string;
  customerName?: string;
  modelYear?: string | number;
  make?: string;
  model?: string;
};

export type BookingRequest = {
  email: string;
  customerName: string;
  modelYear: number;
  make: string;
  model: string;
};

export type BookingConfirmation = {
  id: string;
  serviceName: string;
  start: string;
  duration: number;
  booked: boolean;
  email: string;
  customerName: string;
  modelYear: string | number;
  make: string;
  model: string;
};
