import SuccessIcon from "@assets/success-icon.svg";
import { confirmationCopy } from "@copy/booking";
import Button from "@core-components/Button";
import StatusView from "@core-components/StatusView";
import { formatDateTime, formatDuration } from "@utils/format";
import { queryKeys } from "@utils/queries";
import type { BookingConfirmation } from "@utils/types";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import Animated, { FadeInUp, ZoomIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./ConfirmationPage.styles";

export type ConfirmationPageProps = {
  appointmentId: string;
  onBookAnother: () => void;
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <View accessible style={styles.detail}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

/** Shows exactly what the booking API returned; nothing from the form. */
const ConfirmationPage = ({ appointmentId, onBookAnother }: ConfirmationPageProps) => {
  const queryClient = useQueryClient();
  // Read once: later cache garbage collection shouldn't blank the screen.
  const [confirmation] = useState(() =>
    queryClient.getQueryData<BookingConfirmation>(queryKeys.confirmation(appointmentId)),
  );

  if (!confirmation) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusView message={confirmationCopy.missing} onRetry={onBookAnother} retryLabel={confirmationCopy.startOver} />
      </SafeAreaView>
    );
  }

  const { labels } = confirmationCopy;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Animated.View entering={ZoomIn.springify().damping(12)}>
            <SuccessIcon accessibilityElementsHidden height={48} importantForAccessibility="no-hide-descendants" width={48} />
          </Animated.View>
          <Text accessibilityRole="header" style={styles.heading}>
            {confirmationCopy.heading}
          </Text>
        </View>

        <Animated.View entering={FadeInUp.delay(150).duration(300)} style={styles.card}>
          <Detail label={labels.service} value={confirmation.serviceName} />
          <Detail label={labels.when} value={formatDateTime(confirmation.start)} />
          <Detail label={labels.duration} value={formatDuration(confirmation.duration)} />
          <Detail label={labels.name} value={confirmation.customerName} />
          <Detail label={labels.email} value={confirmation.email} />
          <Detail
            label={labels.vehicle}
            value={`${confirmation.modelYear} ${confirmation.make} ${confirmation.model}`}
          />
          <Detail label={labels.reference} value={confirmation.id} />
        </Animated.View>

        <Button onPress={onBookAnother}>{confirmationCopy.bookAnother}</Button>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ConfirmationPage;
