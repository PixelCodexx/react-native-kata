import { servicesCopy } from "@copy/booking";
import Button from "@core-components/Button";
import { formatDateTime, formatDuration } from "@utils/format";
import type { Appointment } from "@utils/types";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import styles from "./ServicesPage.styles";

export type ServiceSlotsProps = {
  slots: Appointment[];
  onBook: (appointment: Appointment) => void;
};

/** Expanded body of a service card: pick a slot, then book it. */
const ServiceSlots = ({ slots, onBook }: ServiceSlotsProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // A refresh can remove the selected slot; never book one we no longer show.
  const selected = slots.find((slot) => slot.id === selectedId);

  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.slots}>
      <Text accessibilityRole="header" style={styles.slotsHeading}>
        {servicesCopy.slotsHeading}
      </Text>

      <View accessibilityRole="radiogroup" style={styles.slotList}>
        {slots.map((slot) => {
          const checked = slot.id === selected?.id;
          const label = formatDateTime(slot.start);
          return (
            <Pressable
              key={slot.id}
              accessibilityLabel={`${label}, ${formatDuration(slot.duration, { long: true })}`}
              accessibilityRole="radio"
              accessibilityState={{ checked }}
              onPress={() => setSelectedId(slot.id)}
              style={styles.slot}
            >
              <View style={styles.radio}>{checked ? <View style={styles.radioDot} /> : null}</View>
              <Text style={styles.slotText}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Button disabled={!selected} onPress={() => selected && onBook(selected)} style={styles.bookButton}>
        {servicesCopy.bookNow}
      </Button>
    </Animated.View>
  );
};

export default ServiceSlots;
