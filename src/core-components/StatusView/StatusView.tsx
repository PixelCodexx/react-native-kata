import { ActivityIndicator, Text } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import Button from "@core-components/Button";
import { colors } from "@styles/colors";
import styles from "./StatusView.styles";

export type StatusViewProps = {
  message: string;
  loading?: boolean;
  tone?: "neutral" | "error";
  onRetry?: () => void;
  retryLabel?: string;
  retrying?: boolean;
};

/** Centered loading, empty or error message, with an optional retry action. */
const StatusView = ({
  message,
  loading = false,
  tone = "neutral",
  onRetry,
  retryLabel = "Try again",
  retrying = false,
}: StatusViewProps) => {
  const isError = tone === "error";

  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.container}>
      {loading ? <ActivityIndicator color={colors.primary} size="large" /> : null}
      <Text
        accessibilityRole={isError ? "alert" : "text"}
        accessibilityLiveRegion="polite"
        style={[styles.message, isError && styles.error]}
      >
        {message}
      </Text>
      {onRetry ? (
        <Button disabled={retrying} onPress={onRetry}>
          {retrying ? "Retrying…" : retryLabel}
        </Button>
      ) : null}
    </Animated.View>
  );
};

export default StatusView;
