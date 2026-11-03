import DetailIcon from "@assets/detail-icon.svg";
import OilChangeIcon from "@assets/oil-change-icon.svg";
import TiresIcon from "@assets/tires-icon.svg";
import { Text, View } from "react-native";
import styles from "./ServicesPage.styles";

const ICON_SIZE = 56;

// Match on name: the API's ids aren't documented as stable.
const ICONS = [
  { pattern: /oil/i, Icon: OilChangeIcon },
  { pattern: /tire/i, Icon: TiresIcon },
  { pattern: /detail/i, Icon: DetailIcon },
];

/** Decorative icon for a service; no supplied asset falls back to its initial. */
const ServiceIcon = ({ name }: { name: string }) => {
  const match = ICONS.find(({ pattern }) => pattern.test(name));

  if (match) {
    return <match.Icon accessibilityElementsHidden height={ICON_SIZE} importantForAccessibility="no-hide-descendants" width={ICON_SIZE} />;
  }

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.iconPlaceholder, { height: ICON_SIZE, width: ICON_SIZE }]}
    >
      <Text style={styles.iconPlaceholderText}>{name.charAt(0)}</Text>
    </View>
  );
};

export default ServiceIcon;
