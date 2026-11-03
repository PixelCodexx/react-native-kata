import type { BookingRequest } from "./types";

export type BookingFormValues = {
  customerName: string;
  email: string;
  modelYear: string;
  make: string;
  model: string;
};

export type BookingFormField = keyof BookingFormValues;
export type BookingFormErrors = Partial<Record<BookingFormField, string>>;

export const EMPTY_BOOKING_FORM: BookingFormValues = {
  customerName: "",
  email: "",
  modelYear: "",
  make: "",
  model: "",
};

export const MIN_MODEL_YEAR = 1900;

// Deliberately loose: one "@" and a dot in the domain. The server checks
// nothing beyond presence, and the real proof is a delivered email.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateField = (
  field: BookingFormField,
  rawValue: string,
  now: Date = new Date(),
): string | undefined => {
  const value = rawValue.trim();

  switch (field) {
    case "customerName":
      return value ? undefined : "Enter your name.";
    case "email":
      if (!value) return "Enter your email address.";
      return EMAIL_PATTERN.test(value) ? undefined : "Enter a valid email address, like name@example.com.";
    case "modelYear": {
      if (!value) return "Enter your vehicle's year.";
      const maxYear = now.getFullYear() + 1;
      if (!/^\d{4}$/.test(value)) return "Enter a 4-digit year.";
      const year = Number(value);
      return year >= MIN_MODEL_YEAR && year <= maxYear
        ? undefined
        : `Enter a year between ${MIN_MODEL_YEAR} and ${maxYear}.`;
    }
    case "make":
      return value ? undefined : "Enter your vehicle's make.";
    case "model":
      return value ? undefined : "Enter your vehicle's model.";
  }
};

export const validateBookingForm = (
  values: BookingFormValues,
  now: Date = new Date(),
): BookingFormErrors => {
  const errors: BookingFormErrors = {};
  for (const field of Object.keys(values) as BookingFormField[]) {
    const error = validateField(field, values[field], now);
    if (error) errors[field] = error;
  }
  return errors;
};

/** Assumes `values` already passed validation. */
export const toBookingRequest = (values: BookingFormValues): BookingRequest => ({
  customerName: values.customerName.trim(),
  email: values.email.trim(),
  modelYear: Number(values.modelYear.trim()),
  make: values.make.trim(),
  model: values.model.trim(),
});
