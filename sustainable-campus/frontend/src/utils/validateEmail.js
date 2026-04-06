/**
 * Email validation utility — frontend mirror of backend validation
 * Used across all auth forms for consistent client-side checks
 */

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

/**
 * Validate email format
 * @param {string} email
 * @returns {{ valid: boolean, message: string }}
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { valid: false, message: 'Email address is required' };
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return { valid: false, message: 'Please enter a valid email address (e.g. user@example.com)' };
  }
  return { valid: true, message: '' };
};

export default validateEmail;
