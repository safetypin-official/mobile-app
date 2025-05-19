import React from "react";
import { View, Text, TextInput, StyleSheet, TextStyle } from "react-native";

interface InputFieldProps {
  label?: string;
  placeholder: string;
  secureTextEntry?: boolean;
  onChangeText?: (text: string) => void;
  testID?: string;
  labelColor?: string;
  multiline?: boolean;
  style?: TextStyle; // Only accept TextStyle for TextInput
  value?: string; // Add value prop for controlled inputs
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  secureTextEntry = false,
  onChangeText,
  testID = "input-field",
  labelColor = "#FFFFFF", 
  multiline = false,
  style,
  value,
}) => {
  return (
    <View style={styles.container} testID={testID}>
      {label && <Text style={[styles.label, { color: labelColor }]}>{label}</Text>}
      <TextInput
        style={[styles.input, multiline && styles.multilineInput, style]} // Apply custom style
        placeholder={placeholder}
        placeholderTextColor="#904a47"
        secureTextEntry={secureTextEntry}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={multiline ? 5 : 1}
        textAlignVertical={multiline ? "top" : "center"} // Fix text alignment for Android
        value={value}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    width: "100%",
  },
  label: {
    marginBottom: 6,
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#E8D6D4",
    fontSize: 16,
  },
  multilineInput: {
    height: 100, // Default height for multiline inputs
    paddingTop: 12,  // Ensure text starts from the top
    textAlignVertical: "top", // Critical for Android
  },
});

export default InputField;
