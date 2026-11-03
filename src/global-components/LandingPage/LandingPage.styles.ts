import { colors } from "@styles/colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    alignItems: "center",
    flexGrow: 1,
    gap: 24,
    justifyContent: "center",
    padding: 24,
  },
  heading: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  logoFrame: {
    aspectRatio: 700 / 490,
    maxWidth: 360,
    width: "100%",
  },
  logo: {
    height: "100%",
    width: "100%",
  },
  intro: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 480,
    textAlign: "center",
  },
  cta: {
    maxWidth: 320,
    width: "100%",
  },
  support: {
    alignItems: "center",
  },
  supportHeading: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: "600",
  },
});
