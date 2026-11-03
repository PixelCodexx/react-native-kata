import { bookingCopy } from "@copy/booking";
import StatusView from "@core-components/StatusView";
import { getAvailableSlots } from "@utils/availability";
import { formatDateTime, formatDuration } from "@utils/format";
import { getErrorMessage } from "@utils/http";
import { isAlreadyBookedError, useAppointment, useBookAppointment } from "@utils/queries";
import { useState, type ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BookingForm from "./BookingForm";
import styles from "./BookingPage.styles";

export type BookingPageProps = {
  appointmentId: string;
  /** Needed to look the slot up without the privacy-leaking `/appointments`. */
  serviceId: number;
  /**
   * Height of anything above this page (e.g. the navigation header).
   * KeyboardAvoidingView measures itself relative to its parent, so without
   * this it under-counts the keyboard by that much on Android.
   */
  keyboardOffset?: number;
  onBooked: (appointmentId: string) => void;
  onChooseAnother: () => void;
};

const BookingPage = ({ appointmentId, serviceId, keyboardOffset = 0, onBooked, onChooseAnother }: BookingPageProps) => {
  const appointment = useAppointment(serviceId, appointmentId);
  const booking = useBookAppointment();
  const slot = appointment.data;
  const [openedAt] = useState(() => new Date());

  const renderStatus = (content: ReactNode) => (
    <SafeAreaView edges={["bottom", "left", "right"]} style={[styles.screen, styles.statusScreen]}>
      {content}
    </SafeAreaView>
  );

  // Disabled queries (no valid serviceId) stay pending; treat them as missing.
  if (appointment.isPending && appointment.fetchStatus !== "idle") {
    return renderStatus(<StatusView loading message={bookingCopy.loading} />);
  }

  // A failed background re-check keeps the slot we already have (as the
  // services list does); the server still has the final say on booking.
  if (appointment.isError && appointment.data === undefined) {
    return renderStatus(
      <StatusView
        message={getErrorMessage(appointment.error)}
        onRetry={() => void appointment.refetch()}
        retrying={appointment.isFetching}
        tone="error"
      />,
    );
  }

  // Once our booking succeeds the slot reads as booked; keep the form on
  // screen while navigation to the confirmation happens.
  const unavailable = !slot || getAvailableSlots([slot], openedAt).length === 0;
  if (unavailable && !booking.isSuccess) {
    return renderStatus(
      <StatusView
        message={isAlreadyBookedError(booking.error) ? getErrorMessage(booking.error) : bookingCopy.unavailable}
        onRetry={onChooseAnother}
        retryLabel={bookingCopy.chooseAnother}
      />,
    );
  }

  const submitError = booking.isError ? getErrorMessage(booking.error) : null;

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={styles.screen}>
      {/* iOS: the ScrollView insets itself for the keyboard. */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "android" ? "padding" : undefined}
        keyboardVerticalOffset={keyboardOffset}
        style={styles.flex}
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={styles.content}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
        >
          <Text accessibilityRole="header" style={styles.heading}>
            {bookingCopy.title}
          </Text>

          {slot ? (
            <View accessible style={styles.summary}>
              <Text style={styles.summaryService}>{slot.serviceName}</Text>
              <Text style={styles.summaryText}>{formatDateTime(slot.start)}</Text>
              <Text style={styles.summaryText}>{formatDuration(slot.duration)}</Text>
            </View>
          ) : null}

          <BookingForm
            onSubmit={(body) =>
              booking.mutate({ id: appointmentId, body }, { onSuccess: (confirmation) => onBooked(confirmation.id) })
            }
            submitError={submitError}
            submitting={booking.isPending || booking.isSuccess}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default BookingPage;
