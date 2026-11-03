import { Linking, Text, type StyleProp, type TextStyle } from "react-native";
import styles from "./Link.styles";

export type LinkProps = {
  children: string;
  /** External URL such as `mailto:` or `tel:`. */
  href: string;
  accessibilityHint?: string;
  style?: StyleProp<TextStyle>;
};

const Link = ({ children, href, accessibilityHint, style }: LinkProps) => {
  const open = () => {
    // Simulators often have no mail or phone app; there is nothing useful to
    // recover, and the address stays visible to copy.
    Linking.openURL(href).catch(() => undefined);
  };

  return (
    <Text
      accessibilityRole="link"
      accessibilityHint={accessibilityHint}
      onPress={open}
      style={[styles.link, style]}
      suppressHighlighting={false}
    >
      {children}
    </Text>
  );
};

export default Link;
