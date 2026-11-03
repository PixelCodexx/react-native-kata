import { bookingCopy } from "@copy/booking";
import Button from "@core-components/Button";
import Notice from "@core-components/Notice";
import TextField from "@core-components/TextField";
import {
  EMPTY_BOOKING_FORM,
  toBookingRequest,
  validateBookingForm,
  validateField,
  type BookingFormErrors,
  type BookingFormField,
  type BookingFormValues,
} from "@utils/validation";
import type { BookingRequest } from "@utils/types";
import { useRef, useState } from "react";
import { Text, TextInput, View } from "react-native";
import styles from "./BookingPage.styles";

const FIELD_ORDER: BookingFormField[] = ["customerName", "email", "modelYear", "make", "model"];

export type BookingFormProps = {
  submitting: boolean;
  /** Shown beside the submit button, where the user's attention is. */
  submitError?: string | null;
  onSubmit: (request: BookingRequest) => void;
};

const BookingForm = ({ submitting, submitError, onSubmit }: BookingFormProps) => {
  const [values, setValues] = useState<BookingFormValues>(EMPTY_BOOKING_FORM);
  const [errors, setErrors] = useState<BookingFormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<BookingFormField, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const nameInput = useRef<TextInput>(null);
  const emailInput = useRef<TextInput>(null);
  const yearInput = useRef<TextInput>(null);
  const makeInput = useRef<TextInput>(null);
  const modelInput = useRef<TextInput>(null);

  const focus = (field: BookingFormField) => {
    const input = {
      customerName: nameInput,
      email: emailInput,
      modelYear: yearInput,
      make: makeInput,
      model: modelInput,
    }[field];
    input.current?.focus();
  };

  const errorFor = (field: BookingFormField) =>
    touched[field] || submitAttempted ? errors[field] : undefined;

  const change = (field: BookingFormField, text: string) => {
    setValues((current) => ({ ...current, [field]: text }));
    // Once an error is visible, update it as the user fixes it.
    if (touched[field] || submitAttempted) {
      setErrors((current) => ({ ...current, [field]: validateField(field, text) }));
    }
  };

  const blur = (field: BookingFormField) => {
    setTouched((current) => ({ ...current, [field]: true }));
    setErrors((current) => ({ ...current, [field]: validateField(field, values[field]) }));
  };

  const submit = () => {
    if (submitting) return;
    setSubmitAttempted(true);
    const nextErrors = validateBookingForm(values);
    setErrors(nextErrors);

    const firstInvalid = FIELD_ORDER.find((field) => nextErrors[field]);
    if (firstInvalid) {
      focus(firstInvalid);
      return;
    }
    onSubmit(toBookingRequest(values));
  };

  const { fields } = bookingCopy;

  return (
    <View style={styles.form}>
      <TextField
        ref={nameInput}
        testID="booking-name"
        autoCapitalize="words"
        autoComplete="name"
        editable={!submitting}
        error={errorFor("customerName")}
        label={fields.customerName}
        onBlur={() => blur("customerName")}
        onChangeText={(text) => change("customerName", text)}
        onSubmitEditing={() => focus("email")}
        returnKeyType="next"
        submitBehavior="submit"
        textContentType="name"
        value={values.customerName}
      />
      <TextField
        ref={emailInput}
        testID="booking-email"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        editable={!submitting}
        error={errorFor("email")}
        keyboardType="email-address"
        label={fields.email}
        onBlur={() => blur("email")}
        onChangeText={(text) => change("email", text)}
        onSubmitEditing={() => focus("modelYear")}
        returnKeyType="next"
        submitBehavior="submit"
        textContentType="emailAddress"
        value={values.email}
      />

      <Text accessibilityRole="header" style={styles.sectionHeading}>
        {bookingCopy.vehicleHeading}
      </Text>
      <TextField
        ref={yearInput}
        testID="booking-year"
        editable={!submitting}
        error={errorFor("modelYear")}
        keyboardType="number-pad"
        label={fields.modelYear}
        maxLength={4}
        onBlur={() => blur("modelYear")}
        onChangeText={(text) => change("modelYear", text)}
        onSubmitEditing={() => focus("make")}
        placeholder="e.g. 2020"
        returnKeyType="next"
        submitBehavior="submit"
        value={values.modelYear}
      />
      <TextField
        ref={makeInput}
        testID="booking-make"
        autoCapitalize="words"
        editable={!submitting}
        error={errorFor("make")}
        label={fields.make}
        onBlur={() => blur("make")}
        onChangeText={(text) => change("make", text)}
        onSubmitEditing={() => focus("model")}
        placeholder="e.g. Mazda"
        returnKeyType="next"
        submitBehavior="submit"
        value={values.make}
      />
      <TextField
        ref={modelInput}
        testID="booking-model"
        autoCapitalize="words"
        editable={!submitting}
        error={errorFor("model")}
        label={fields.model}
        onBlur={() => blur("model")}
        onChangeText={(text) => change("model", text)}
        onSubmitEditing={submit}
        placeholder="e.g. Miata"
        returnKeyType="done"
        submitBehavior="blurAndSubmit"
        value={values.model}
      />

      {submitError ? <Notice message={submitError} tone="error" /> : null}
      <Button disabled={submitting} onPress={submit}>
        {submitting ? bookingCopy.submitting : bookingCopy.submit}
      </Button>
    </View>
  );
};

export default BookingForm;
