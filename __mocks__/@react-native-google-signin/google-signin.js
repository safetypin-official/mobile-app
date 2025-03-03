export const GoogleSignin = {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn().mockResolvedValue({
      idToken: "mock-id-token",
      user: { email: "test@example.com", name: "Test User" }
    }),
    signOut: jest.fn()
  };
  