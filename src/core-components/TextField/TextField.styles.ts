import { StyleSheet } from "react-native";
import { colors } from "@styles/colors";

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  input: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    color: colors.error,
    fontSize: 14,
  },
});

export default styles;
