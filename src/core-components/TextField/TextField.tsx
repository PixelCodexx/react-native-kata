import type { Ref } from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";
import { colors } from "@styles/colors";
import styles from "./TextField.styles";

export type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  ref?: Ref<TextInput>;
};

const TextField = ({ label, error, ref, style, ...props }: TextFieldProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        ref={ref}
        accessibilityLabel={label}
        accessibilityHint={error}
        placeholderTextColor={colors.placeholder}
        style={[styles.input, error ? styles.inputError : null, style]}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

export default TextField;
