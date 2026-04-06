/**
 * Email validation utility
 * Used across auth routes for consistent server-side validation
 */

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

/**
 * Validate email format
 * @param {string} email
 * @returns {{ valid: boolean, message: string }}
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email is required' };
  }
  const trimmed = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, message: 'Invalid email format. Please use a valid email like user@example.com' };
  }
  return { valid: true, message: '' };
};

module.exports = { validateEmail, EMAIL_REGEX };
