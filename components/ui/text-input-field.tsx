import { StyleSheet, TextInput, type StyleProp, type TextStyle, type TextInputProps } from 'react-native';

import { Field } from '@/components/ui/field';
import { Colors, ControlHeight, FontFamily, Radius, Spacing } from '@/constants/theme';

export type TextInputFieldProps = TextInputProps & {
  label: string;
  error?: string;
  labelStyle?: StyleProp<TextStyle>;
};

export function TextInputField({ label, error, style, labelStyle, ...props }: TextInputFieldProps) {
  return (
    <Field label={label} error={error} labelStyle={labelStyle}>
      <TextInput
        placeholderTextColor={Colors.textSubtle}
        {...props}
        style={[styles.input, error ? styles.inputError : null, style]}
      />
    </Field>
  );
}

const styles = StyleSheet.create({
  input: {
    height: ControlHeight.input,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    fontFamily: FontFamily.sans,
    fontSize: 15,
    color: Colors.text,
  },
  inputError: { borderColor: Colors.destructive },
});
