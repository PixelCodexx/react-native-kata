import CaretIcon from "@assets/caret-icon.svg";
import { servicesCopy } from "@copy/booking";
import { formatDuration } from "@utils/format";
import type { ServiceAvailability } from "@utils/queries";
import type { Appointment } from "@utils/types";
import { Pressable, Text, View } from "react-native";
import Animated, { ReduceMotion, useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated";
import ServiceIcon from "./ServiceIcon";
import ServiceSlots from "./ServiceSlots";
import styles from "./ServicesPage.styles";

export type ServiceCardProps = {
  item: ServiceAvailability;
  expanded: boolean;
  onToggle: () => void;
  onBook: (appointment: Appointment) => void;
  onRetry: () => void;
  retrying: boolean;
};

const ServiceCard = ({ item, expanded, onToggle, onBook, onRetry, retrying }: ServiceCardProps) => {
  const { service, slots, failed } = item;
  // ReduceMotion.System: no animation when the OS "reduce motion" setting is on.
  const rotation = useDerivedValue(
    () => withTiming(expanded ? 180 : 0, { duration: 200, reduceMotion: ReduceMotion.System }),
    [expanded],
  );
  const caretStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
  const duration = formatDuration(service.duration);

  if (failed) {
    return (
      <View style={[styles.card, styles.cardHeader]}>
        <ServiceIcon name={service.name} />
        <View style={styles.cardTitle}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text accessibilityLiveRegion="polite" style={styles.cardError}>
            {servicesCopy.serviceFailed}
          </Text>
        </View>
        <Pressable
          accessibilityHint={`Checks ${service.name} availability again`}
          accessibilityRole="button"
          accessibilityState={{ disabled: retrying }}
          disabled={retrying}
          hitSlop={8}
          onPress={onRetry}
          style={({ pressed }) => (pressed || retrying) && styles.pressed}
        >
          <Text style={styles.retryLink}>{retrying ? "Retrying…" : servicesCopy.retry}</Text>
        </Pressable>
      </View>
    );
  }

  const countLabel = `${slots.length} ${slots.length === 1 ? "appointment" : "appointments"} available`;

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityHint={expanded ? "Hides appointment times" : "Shows appointment times"}
        accessibilityLabel={`${service.name}, ${formatDuration(service.duration, { long: true })}, ${countLabel}`}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={onToggle}
        style={({ pressed }) => [styles.cardHeader, pressed && styles.pressed]}
      >
        <ServiceIcon name={service.name} />
        <View style={styles.cardTitle}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.muted}>
            {duration} · {countLabel}
          </Text>
        </View>
        <Animated.View style={caretStyle}>
          <CaretIcon height={24} width={24} />
        </Animated.View>
      </Pressable>
      {expanded ? (
        <View style={styles.cardBody}>
          <ServiceSlots onBook={onBook} slots={slots} />
        </View>
      ) : null}
    </View>
  );
};

export default ServiceCard;
