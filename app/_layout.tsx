import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Log In' }} />
      <Stack.Screen name="forgotPassword/index" options={{ title: 'Forgot Password' }} />
      <Stack.Screen name="signUp/index" options={{ title: 'Sign Up' }} />
    </Stack>
  );
}
