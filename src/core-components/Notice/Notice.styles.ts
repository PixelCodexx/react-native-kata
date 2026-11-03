import { StyleSheet } from "react-native";
import { colors } from "@styles/colors";

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    gap: 8,
    padding: 12,
  },
  warning: {
    backgroundColor: colors.warningSurface,
  },
  error: {
    backgroundColor: colors.errorSurface,
  },
  message: {
    fontSize: 14,
  },
  warningText: {
    color: colors.warning,
  },
  errorText: {
    color: colors.error,
  },
  action: {
    fontSize: 14,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  dimmed: {
    opacity: 0.5,
  },
});

export default styles;
