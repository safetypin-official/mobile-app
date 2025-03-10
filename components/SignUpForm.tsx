import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import InputField from "./InputField";
import Button from "@/components/Button";
import { SocialButton } from "./SocialButton";
import validator from "validator";

interface SignUpFormProps {
  onSignUp: (userData: {
    username: string;
    email: string;
    dateOfBirth: string;
    password: string;
  }) => void;
  onLogIn: () => void;
  onGoogleAuth: () => void;
  onAppleAuth: () => void;
  testID: string;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSignUp, onLogIn, onGoogleAuth, onAppleAuth, testID }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSignUp = () => {
    const validationErrors = validateInputs();
    if (Object.keys(validationErrors).length === 0) {
      // Pass form data to the onSignUp handler
      onSignUp({
        username,
        email,
        dateOfBirth,
        password
      });
    } else {
      setErrors(validationErrors);
    }
  };

  const validateInputs = () => {
    const errors: { [key: string]: string } = {};

    if (!username) {
      errors.username = "Username is required";
    }

    if (!email) {
      errors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      errors.email = "Invalid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (!isStrongPassword(password)) {
      errors.password =
        "Password must be at least 8 characters long and include a number, a special character, and an uppercase letter";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirm Password is required";
    } else if (confirmPassword !== password) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!dateOfBirth) {
      errors.dateOfBirth = "Date of Birth is required";
    } else if (!isValidDateFormat(dateOfBirth)) {
      errors.dateOfBirth = "Date of Birth must be in DD/MM/YYYY format";
    } else if (!isAtLeast16(dateOfBirth)) {
      errors.dateOfBirth = "You must be at least 16 years old";
    }

    return errors;
  };

  const isValidEmail = (email: string): boolean => {
    return !!validator.isEmail(email);
  };

  const isStrongPassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+-])[A-Za-z\d!@#$%^&*()_+-]{8,}$/;
    return !!passwordRegex.test(password);
  };

  const isAtLeast16 = (dateOfBirth: string): boolean => {
    const [day, month, year] = dateOfBirth.split("/");
  
    // Create date object
    const dob = new Date(`${year}-${month}-${day}`);

    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDifference = today.getMonth() - dob.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
      return age - 1 >= 16;
    }
    return age >= 16;
  };

  const isValidDateFormat = (date: string): boolean => {
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    return !!dateRegex.test(date);
  };

  return (
    <SafeAreaView style={styles.safeContainer} testID={testID}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Sign Up</Text>

          <View style={styles.form}>
            <View>
              <InputField
                label="Username"
                placeholder="Username"
                onChangeText={(text) => setUsername(text)}
              />
              {!!errors.username && <Text style={styles.error}>{errors.username}</Text>}
            </View>

            <View>
              <InputField
                label="E-mail"
                placeholder="E-mail address"
                onChangeText={(text) => setEmail(text)}
              />
              {!!errors.email && <Text style={styles.error}>{errors.email}</Text>}
            </View>

            <View>
              <InputField
                label="Date of Birth"
                placeholder="DD/MM/YYYY"
                onChangeText={(text) => setDateOfBirth(text)}
              />
              {!!errors.dateOfBirth && <Text style={styles.error}>{errors.dateOfBirth}</Text>}
            </View>

            <View>
              <InputField
                label="Password"
                placeholder="Password"
                secureTextEntry={true}
                onChangeText={(text) => setPassword(text)}
              />
              {!!errors.password && <Text style={styles.error}>{errors.password}</Text>}
            </View>

            <View>
              <InputField
                label="Confirm Password"
                placeholder="Confirm Password"
                secureTextEntry={true}
                onChangeText={(text) => setConfirmPassword(text)}
              />
              {!!errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}
            </View>

          <View style={styles.socialButtonsContainer}>
            <SocialButton icon="google" onPress={onGoogleAuth} testID="google-auth"/>
            <SocialButton icon="apple" onPress={onAppleAuth} testID="apple-auth"/>
          </View>
            <Button onPress={handleSignUp} testID="signup-button">Sign Up</Button>
          </View>

          <Text style={styles.loginText}>
            Already have an account?{" "}
            <TouchableOpacity onPress={onLogIn} testID="login-link">
              <Text style={styles.loginLink}>Log in.</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#7B241C",
    width: "100%",
  },
  scrollContainer: {
    flexGrow: 1,
    marginTop: 50,
    marginBottom: 50
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7B241C",
    paddingHorizontal: "10%",
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: "white",
  },
  form: {
    width: "100%",
    marginTop: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  loginText: {
    marginTop: 30,
    color: "white",
    textAlign: "center",
  },
  loginLink: {
    color: "#e2c28c",
    fontWeight: "bold",
  },
  inputField: {
    marginBottom: 0,
  },
  error: {
    color: "#dd756c",
    fontSize: 12,
    marginTop: -10,
    marginBottom: 4,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 24
  },
});

export default SignUpForm;