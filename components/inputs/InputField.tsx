import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

interface InputFieldProps {
  label?: string;
  placeholder: string;
  secureTextEntry?: boolean;
  onChangeText?: (text: string) => void;
  testID?: string;
  labelColor?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  secureTextEntry = false,
  onChangeText,
  testID = "input-field",
  labelColor = "#FFFFFF", // Default to white
}) => {
  return (
    <View style={styles.container} testID={testID}>
      {label && <Text style={[styles.label, { color: labelColor }]}>{label}</Text>}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#904a47"
        secureTextEntry={secureTextEntry}
        onChangeText={onChangeText}
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
});

export default InputField;
