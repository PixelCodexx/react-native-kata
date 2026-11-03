import { colors } from "@styles/colors";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  heading: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: "bold",
    paddingHorizontal: 16,
    paddingVertical: 8,
    textAlign: "center",
  },
  list: {
    gap: 16,
    padding: 16,
  },
  listHeader: {
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    minHeight: 72,
    padding: 16,
  },
  pressed: {
    opacity: 0.6,
  },
  cardTitle: {
    flex: 1,
    gap: 2,
  },
  serviceName: {
    color: colors.textMuted,
    fontSize: 18,
    fontWeight: "bold",
  },
  cardBody: {
    borderTopColor: colors.text,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
  },
  iconPlaceholder: {
    alignItems: "center",
    backgroundColor: colors.iconPlaceholder,
    borderRadius: 999,
    justifyContent: "center",
  },
  iconPlaceholderText: {
    color: colors.textMuted,
    fontSize: 24,
    fontWeight: "bold",
  },
  cardError: {
    color: colors.error,
    fontSize: 14,
  },
  retryLink: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  muted: {
    color: colors.textMuted,
    fontSize: 14,
  },
  slots: {
    gap: 12,
  },
  slotsHeading: {
    color: colors.text,
    fontSize: 16,
  },
  slotList: {
    gap: 4,
  },
  slot: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    minHeight: 44,
  },
  radio: {
    alignItems: "center",
    borderColor: colors.primary,
    borderRadius: 999,
    borderWidth: 2,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  radioDot: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 12,
    width: 12,
  },
  slotText: {
    color: colors.primary,
    flex: 1,
    fontSize: 15,
  },
  bookButton: {
    alignSelf: "flex-start",
  },
});

export default styles;
