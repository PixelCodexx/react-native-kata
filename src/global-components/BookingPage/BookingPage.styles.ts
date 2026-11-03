import { colors } from "@styles/colors";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  // Only for loading/error states: centering the form would push it back
  // under the keyboard when KeyboardAvoidingView shrinks.
  statusScreen: {
    justifyContent: "center",
  },
  flex: {
    flex: 1,
  },
  content: {
    gap: 20,
    padding: 16,
    paddingBottom: 32,
  },
  heading: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  summary: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 16,
  },
  summaryService: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  summaryText: {
    color: colors.textMuted,
    fontSize: 15,
  },
  form: {
    gap: 16,
  },
  sectionHeading: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },
});

export default styles;
