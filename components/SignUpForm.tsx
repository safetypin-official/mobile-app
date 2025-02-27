import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

interface SignUpFormProps {
  onSignUp: () => void;
  onLogIn: () => void;
  testID?: string;
}

export default function SignUpForm({ onSignUp, onLogIn, testID }: SignUpFormProps) {
  return (
    <View testID={testID}>
      <TextInput placeholder="Username" />
      <TextInput placeholder="E-mail address" />
      <TextInput placeholder="Date of Birth" />
      <TextInput placeholder="Password" secureTextEntry />
      <TextInput placeholder="Confirm Password" secureTextEntry />

      <TouchableOpacity onPress={onSignUp}>
        <Text>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onLogIn}>
        <Text>Log In.</Text>
      </TouchableOpacity>
    </View>
  );
}