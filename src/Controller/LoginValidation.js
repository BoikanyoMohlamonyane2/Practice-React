export const validateLogin = (email, password) => {
  const errors = {};

  // Email Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    errors.email = 'Email is required.';
  } else if (!emailRegex.test (email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 6) {
    errors.password = 'Password mut be at least 6 characters';
  }
  return errors;
};
