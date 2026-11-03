import { Pressable, Text } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import styles from "./Notice.styles";

export type NoticeProps = {
  message: string;
  tone?: "warning" | "error";
  action?: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
  };
};

/** Inline banner for problems the user can keep working through. */
const Notice = ({ message, tone = "warning", action }: NoticeProps) => {
  const toneStyles = tone === "error" ? styles.error : styles.warning;
  const textStyle = tone === "error" ? styles.errorText : styles.warningText;

  return (
    <Animated.View entering={FadeIn.duration(200)} style={[styles.container, toneStyles]}>
      <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.message, textStyle]}>
        {message}
      </Text>
      {action ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: Boolean(action.disabled) }}
          disabled={action.disabled}
          hitSlop={8}
          onPress={action.onPress}
          style={({ pressed }) => (pressed || action.disabled) && styles.dimmed}
        >
          <Text style={[styles.action, textStyle]}>{action.label}</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
};

export default Notice;
