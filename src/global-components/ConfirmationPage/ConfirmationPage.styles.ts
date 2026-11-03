import { colors } from "@styles/colors";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
  },
  content: {
    flexGrow: 1,
    gap: 24,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    gap: 12,
  },
  heading: {
    color: colors.success,
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  card: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  detail: {
    gap: 2,
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: 13,
    textTransform: "uppercase",
  },
  detailValue: {
    color: colors.text,
    fontSize: 16,
  },
});

export default styles;
