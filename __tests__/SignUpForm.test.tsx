import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignUpForm from '@/components/SignUpForm';

// Mock the validator module
jest.mock('validator', () => ({
  isEmail: jest.fn((email) => email.includes('@') && email.includes('.'))
}));

describe('SignUpForm', () => {
  const mockOnSignUp = jest.fn();
  const mockOnLogIn = jest.fn();
  const mockOnGoogleAuth = jest.fn();
  const mockOnAppleAuth = jest.fn();

  const defaultProps = {
    onSignUp: mockOnSignUp,
    onLogIn: mockOnLogIn,
    onGoogleAuth: mockOnGoogleAuth,
    onAppleAuth: mockOnAppleAuth,
    testID: 'signup-form'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Basic rendering test
  it('renders correctly', () => {
    const { getAllByText, getByTestId, getByPlaceholderText } = render(<SignUpForm {...defaultProps} />);
    
    // Get by testID or more specific selectors
    expect(getByTestId('signup-form')).toBeTruthy();
    expect(getByPlaceholderText('Username')).toBeTruthy();
    expect(getByPlaceholderText('E-mail address')).toBeTruthy();
    expect(getByPlaceholderText('DD/MM/YYYY')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
    
    // For buttons and links
    expect(getByTestId('signup-button')).toBeTruthy();
    expect(getByTestId('google-auth')).toBeTruthy();
    expect(getByTestId('apple-auth')).toBeTruthy();
    expect(getByTestId('login-link')).toBeTruthy();
    
    // Check the title text is present
    const signUpTexts = getAllByText('Sign Up');
    // Find the title element (it should have a larger font size)
    const titleElement = signUpTexts.find(element => 
      element.props.style && element.props.style.fontSize === 40);
    expect(titleElement).toBeTruthy();
    
    // Check for "Already have an account" text
    const loginTextElement = getAllByText(/Already have an account\?/);
    expect(loginTextElement.length).toBeGreaterThan(0);
  });

  // Testing form navigation
  it('calls onLogIn when login link is pressed', () => {
    const { getByTestId } = render(<SignUpForm {...defaultProps} />);
    fireEvent.press(getByTestId('login-link'));
    expect(mockOnLogIn).toHaveBeenCalledTimes(1);
  });

  // Testing social authentication
  it('calls onGoogleAuth when Google button is pressed', () => {
    const { getByTestId } = render(<SignUpForm {...defaultProps} />);
    fireEvent.press(getByTestId('google-auth'));
    expect(mockOnGoogleAuth).toHaveBeenCalledTimes(1);
  });

  it('calls onAppleAuth when Apple button is pressed', () => {
    const { getByTestId } = render(<SignUpForm {...defaultProps} />);
    fireEvent.press(getByTestId('apple-auth'));
    expect(mockOnAppleAuth).toHaveBeenCalledTimes(1);
  });

  // Testing form validation errors
  it('shows validation errors when form is empty', () => {
    const { getByTestId, getByText } = render(<SignUpForm {...defaultProps} />);
    
    fireEvent.press(getByTestId('signup-button'));
    
    expect(getByText('Username is required')).toBeTruthy();
    expect(getByText('Email is required')).toBeTruthy();
    expect(getByText('Date of Birth is required')).toBeTruthy();
    expect(getByText('Password is required')).toBeTruthy();
    expect(getByText('Confirm Password is required')).toBeTruthy();
    
    expect(mockOnSignUp).not.toHaveBeenCalled();
  });

  // Testing individual field validations
  it('validates email format', () => {
    const { getByTestId, getByText, getByPlaceholderText } = render(<SignUpForm {...defaultProps} />);
    
    // Fill in invalid email
    fireEvent.changeText(getByPlaceholderText('E-mail address'), 'invalid-email');
    fireEvent.press(getByTestId('signup-button'));
    
    expect(getByText('Invalid email address')).toBeTruthy();
  });

  it('validates password strength', () => {
    const { getByTestId, getByText, getByPlaceholderText } = render(<SignUpForm {...defaultProps} />);
    
    // Fill in weak password - missing uppercase
    fireEvent.changeText(getByPlaceholderText('Password'), 'password1!');
    fireEvent.press(getByTestId('signup-button'));
    
    expect(getByText('Password must be at least 8 characters long and include a number, a special character, and an uppercase letter')).toBeTruthy();
    
    // Fill in weak password - missing number
    fireEvent.changeText(getByPlaceholderText('Password'), 'Password!');
    fireEvent.press(getByTestId('signup-button'));
    
    expect(getByText('Password must be at least 8 characters long and include a number, a special character, and an uppercase letter')).toBeTruthy();
    
    // Fill in weak password - missing special character
    fireEvent.changeText(getByPlaceholderText('Password'), 'Password1');
    fireEvent.press(getByTestId('signup-button'));
    
    expect(getByText('Password must be at least 8 characters long and include a number, a special character, and an uppercase letter')).toBeTruthy();
    
    // Fill in weak password - too short
    fireEvent.changeText(getByPlaceholderText('Password'), 'Pw1!');
    fireEvent.press(getByTestId('signup-button'));
    
    expect(getByText('Password must be at least 8 characters long and include a number, a special character, and an uppercase letter')).toBeTruthy();
  });

  it('validates password matching', () => {
    const { getByTestId, getByText, getByPlaceholderText } = render(<SignUpForm {...defaultProps} />);
    
    // Fill in non-matching passwords
    fireEvent.changeText(getByPlaceholderText('Password'), 'StrongPassword1!');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'DifferentPassword1!');
    fireEvent.press(getByTestId('signup-button'));
    
    expect(getByText('Passwords do not match')).toBeTruthy();
  });

  it('validates date format', () => {
    const { getByTestId, getByText, getByPlaceholderText } = render(<SignUpForm {...defaultProps} />);
    
    // Fill in invalid date format
    fireEvent.changeText(getByPlaceholderText('DD/MM/YYYY'), '2000-01-01');
    fireEvent.press(getByTestId('signup-button'));
    
    expect(getByText('Date of Birth must be in DD/MM/YYYY format')).toBeTruthy();
    
    // Test another invalid format
    fireEvent.changeText(getByPlaceholderText('DD/MM/YYYY'), '01-01-2000');
    fireEvent.press(getByTestId('signup-button'));
    
    expect(getByText('Date of Birth must be in DD/MM/YYYY format')).toBeTruthy();
    
    // Test incorrect length
    fireEvent.changeText(getByPlaceholderText('DD/MM/YYYY'), '1/1/2000');
    fireEvent.press(getByTestId('signup-button'));
    
    expect(getByText('Date of Birth must be in DD/MM/YYYY format')).toBeTruthy();
  });

  it('validates minimum age requirement', () => {
    const { getByTestId, getByText, getByPlaceholderText } = render(<SignUpForm {...defaultProps} />);
    
    // Current date minus 15 years (underage)
    const today = new Date();
    const fifteenYearsAgo = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());
    const formattedDate = `${String(fifteenYearsAgo.getDate()).padStart(2, '0')}/${String(fifteenYearsAgo.getMonth() + 1).padStart(2, '0')}/${fifteenYearsAgo.getFullYear()}`;
    
    fireEvent.changeText(getByPlaceholderText('DD/MM/YYYY'), formattedDate);
    fireEvent.press(getByTestId('signup-button'));
    
    expect(getByText('You must be at least 16 years old')).toBeTruthy();
  });

  // Test that the form passes all validations and submits
  it('submits the form with valid data', async () => {
    const { getByTestId, getByPlaceholderText, queryByText } = render(<SignUpForm {...defaultProps} />);
    
    // Fill in all fields with valid data
    fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('E-mail address'), 'test@example.com');
    
    // Current date minus 20 years (valid age)
    const today = new Date();
    const twentyYearsAgo = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate());
    const formattedDate = `${String(twentyYearsAgo.getDate()).padStart(2, '0')}/${String(twentyYearsAgo.getMonth() + 1).padStart(2, '0')}/${twentyYearsAgo.getFullYear()}`;
    
    fireEvent.changeText(getByPlaceholderText('DD/MM/YYYY'), formattedDate);
    fireEvent.changeText(getByPlaceholderText('Password'), 'StrongPassword1!');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'StrongPassword1!');
    
    fireEvent.press(getByTestId('signup-button'));
    
    // Verify no validation errors are shown
    await waitFor(() => {
      expect(queryByText('Username is required')).toBeNull();
      expect(queryByText('Email is required')).toBeNull();
      expect(queryByText('Date of Birth is required')).toBeNull();
      expect(queryByText('Password is required')).toBeNull();
      expect(queryByText('Confirm Password is required')).toBeNull();
    });
    
    // Verify onSignUp was called with the correct data
    expect(mockOnSignUp).toHaveBeenCalledWith({
      username: 'testuser',
      email: 'test@example.com',
      dateOfBirth: formattedDate,
      password: 'StrongPassword1!'
    });
  });

  // Edge cases
  it('handles invalid date values correctly', () => {
    const { getByTestId, getByPlaceholderText, getByText } = render(<SignUpForm {...defaultProps} />);
    
    // Fill in other required fields
    fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('E-mail address'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'StrongPassword1!');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'StrongPassword1!');
    
    // Use a date in the future to trigger age validation failure
    const today = new Date();
    const futureDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear() + 1}`;
    
    fireEvent.changeText(getByPlaceholderText('DD/MM/YYYY'), futureDate);
    fireEvent.press(getByTestId('signup-button'));
    
    // Should show age validation error for future dates
    expect(getByText('You must be at least 16 years old')).toBeTruthy();
    expect(mockOnSignUp).not.toHaveBeenCalled();
  });

  it('handles malformed date inputs', () => {
    const { getByTestId, getByPlaceholderText, getByText } = render(<SignUpForm {...defaultProps} />);
    
    // Fill in other required fields
    fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('E-mail address'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'StrongPassword1!');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'StrongPassword1!');
    
    // Test with a string that doesn't split into day/month/year correctly
    fireEvent.changeText(getByPlaceholderText('DD/MM/YYYY'), '10/10');
    fireEvent.press(getByTestId('signup-button'));
    
    expect(getByText('Date of Birth must be in DD/MM/YYYY format')).toBeTruthy();
    expect(mockOnSignUp).not.toHaveBeenCalled();
    
    // Another edge case with malformed date
    fireEvent.changeText(getByPlaceholderText('DD/MM/YYYY'), '///');
    fireEvent.press(getByTestId('signup-button'));
    
    expect(getByText('Date of Birth must be in DD/MM/YYYY format')).toBeTruthy();
    expect(mockOnSignUp).not.toHaveBeenCalled();
  });

  it('handles boundary age cases correctly', () => {
    const { getByTestId, getByPlaceholderText, queryByText } = render(<SignUpForm {...defaultProps} />);
    
    // Fill in other required fields
    fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('E-mail address'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'StrongPassword1!');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'StrongPassword1!');
    
    // Exactly 16 years old today
    const today = new Date();
    const sixteenYearsAgo = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
    const formattedDate = `${String(sixteenYearsAgo.getDate()).padStart(2, '0')}/${String(sixteenYearsAgo.getMonth() + 1).padStart(2, '0')}/${sixteenYearsAgo.getFullYear()}`;
    
    fireEvent.changeText(getByPlaceholderText('DD/MM/YYYY'), formattedDate);
    fireEvent.press(getByTestId('signup-button'));
    
    // Should pass validation as exactly 16 is allowed
    expect(queryByText('You must be at least 16 years old')).toBeNull();
    expect(mockOnSignUp).toHaveBeenCalled();
    mockOnSignUp.mockClear();
    
    // One day less than 16 years old
    const almostSixteenYearsAgo = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate() + 1);
    const formattedAlmostDate = `${String(almostSixteenYearsAgo.getDate()).padStart(2, '0')}/${String(almostSixteenYearsAgo.getMonth() + 1).padStart(2, '0')}/${almostSixteenYearsAgo.getFullYear()}`;
    
    fireEvent.changeText(getByPlaceholderText('DD/MM/YYYY'), formattedAlmostDate);
    fireEvent.press(getByTestId('signup-button'));
    
    // Should fail validation as less than 16 is not allowed
    expect(queryByText('You must be at least 16 years old')).toBeTruthy();
    expect(mockOnSignUp).not.toHaveBeenCalled();
  });
  
  it('tests month-based age calculation edge cases', () => {
    const { getByTestId, getByPlaceholderText, queryByText } = render(<SignUpForm {...defaultProps} />);
    
    // Fill in other required fields
    fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('E-mail address'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'StrongPassword1!');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'StrongPassword1!');
    
    // Test case 1: 16 years old but earlier month (16 years and a few months)
    // This tests the age >= 16 branch where monthDifference > 0
    const today = new Date();
    const laterMonthDate = new Date(today.getFullYear() - 16, today.getMonth() - 2, today.getDate());
    const formattedLaterMonth = `${String(laterMonthDate.getDate()).padStart(2, '0')}/${String(laterMonthDate.getMonth() + 1).padStart(2, '0')}/${laterMonthDate.getFullYear()}`;
    
    fireEvent.changeText(getByPlaceholderText('DD/MM/YYYY'), formattedLaterMonth);
    fireEvent.press(getByTestId('signup-button'));
    
    // Should pass as the person is more than 16 years old
    expect(queryByText('You must be at least 16 years old')).toBeNull();
    expect(mockOnSignUp).toHaveBeenCalled();
    mockOnSignUp.mockClear();
    
    // Test case 2: 17 years old, but later month (16 years and 11 months)
    // This tests the (age - 1) >= 16 branch where monthDifference < 0
    const earlierMonthDate = new Date(today.getFullYear() - 17, today.getMonth() + 2, today.getDate());
    const formattedEarlierMonth = `${String(earlierMonthDate.getDate()).padStart(2, '0')}/${String(earlierMonthDate.getMonth() + 1).padStart(2, '0')}/${earlierMonthDate.getFullYear()}`;
    
    fireEvent.changeText(getByPlaceholderText('DD/MM/YYYY'), formattedEarlierMonth);
    fireEvent.press(getByTestId('signup-button'));
    
    // Should pass as (17-1) = 16 which meets the requirement
    expect(queryByText('You must be at least 16 years old')).toBeNull();
    expect(mockOnSignUp).toHaveBeenCalled();
    mockOnSignUp.mockClear();
    
    // Test case 3: 17 years old, same month but later day (slightly less than 17 years)
    // This tests the (age - 1) >= 16 branch where monthDifference = 0 but day is later
    const laterDayDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate() + 5);
    const formattedLaterDay = `${String(laterDayDate.getDate()).padStart(2, '0')}/${String(laterDayDate.getMonth() + 1).padStart(2, '0')}/${laterDayDate.getFullYear()}`;
    
    fireEvent.changeText(getByPlaceholderText('DD/MM/YYYY'), formattedLaterDay);
    fireEvent.press(getByTestId('signup-button'));
    
    // Should pass as (17-1) = 16 which meets the requirement
    expect(queryByText('You must be at least 16 years old')).toBeNull();
    expect(mockOnSignUp).toHaveBeenCalled();
  });

  // Additional tests to ensure complete coverage
  it('tests clearing of errors when valid input is provided after error', () => {
    const { getByTestId, getByPlaceholderText, getByText, queryByText } = render(<SignUpForm {...defaultProps} />);
    
    // Submit empty form to trigger errors
    fireEvent.press(getByTestId('signup-button'));
    
    // Verify errors are shown
    expect(getByText('Username is required')).toBeTruthy();
    
    // Enter valid username
    fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
    
    // Submit again
    fireEvent.press(getByTestId('signup-button'));
    
    // The username error should be gone
    expect(queryByText('Username is required')).toBeNull();
    
    // But other errors should still exist
    expect(getByText('Email is required')).toBeTruthy();
  });

  it('handles valid date format but invalid DOB edge case', () => {
    const { getByTestId, getByPlaceholderText } = render(<SignUpForm {...defaultProps} />);
    
    // Fill in other required fields with valid data
    fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('E-mail address'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'StrongPassword1!');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'StrongPassword1!');
    
    // Enter a future date in valid format
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const formattedFutureDate = `${String(futureDate.getDate()).padStart(2, '0')}/${String(futureDate.getMonth() + 1).padStart(2, '0')}/${futureDate.getFullYear()}`;
    
    fireEvent.changeText(getByPlaceholderText('DD/MM/YYYY'), formattedFutureDate);
    fireEvent.press(getByTestId('signup-button'));
    
    // Should not call onSignUp with a future date
    expect(mockOnSignUp).not.toHaveBeenCalled();
  });

  // Test for line 113 - Testing the age - 1 >= 16 branch
  it('handles exactly 17 years ago but with future month (16 years old check)', () => {
    const { getByTestId, getByPlaceholderText } = render(<SignUpForm {...defaultProps} />);
    
    // Fill in other required fields with valid data
    fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('E-mail address'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'StrongPassword1!');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'StrongPassword1!');
    
    // Calculate a date that is exactly 17 years ago but with a future month
    const today = new Date();
    const dateWithFutureMonth = new Date(
      today.getFullYear() - 17,          // 17 years ago
      today.getMonth() + 1,              // Next month
      today.getDate()                    // Same day
    );
    
    // Format the date as DD/MM/YYYY
    const formattedDate = `${String(dateWithFutureMonth.getDate()).padStart(2, '0')}/${
      String(dateWithFutureMonth.getMonth() + 1).padStart(2, '0')}/${
      dateWithFutureMonth.getFullYear()}`;
    
    fireEvent.changeText(getByPlaceholderText('DD/MM/YYYY'), formattedDate);
    fireEvent.press(getByTestId('signup-button'));
    
    // This should pass the age check (17-1 = 16) and allow submission
    expect(mockOnSignUp).toHaveBeenCalled();
  });

  
});

