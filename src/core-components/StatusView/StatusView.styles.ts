import { StyleSheet } from "react-native";
import { colors } from "@styles/colors";

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 16,
    justifyContent: "center",
    padding: 24,
  },
  message: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: "center",
  },
  error: {
    color: colors.error,
  },
});

export default styles;
