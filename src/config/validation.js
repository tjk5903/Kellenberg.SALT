// ============================================
// VALIDATION CONFIGURATION
// ============================================
// Toggle this for testing purposes

/**
 * Set to true to enforce @kellenberg.org email validation
 * Set to false to allow any email during testing
 */
export const ENFORCE_KELLENBERG_EMAIL = false; // Change to true for production

/**
 * The required email domain
 */
export const REQUIRED_EMAIL_DOMAIN = '@kellenberg.org';

/**
 * Validates if an email matches the required domain
 * @param {string} email - The email to validate
 * @returns {boolean} - True if valid or validation is disabled
 */
export const validateEmail = (email) => {
  if (!ENFORCE_KELLENBERG_EMAIL) {
    return true; // Skip validation when disabled
  }
  return email.endsWith(REQUIRED_EMAIL_DOMAIN);
};

/**
 * Gets the appropriate error message for invalid email
 * @returns {string} - The error message to display
 */
export const getEmailErrorMessage = () => {
  return `You must use a ${REQUIRED_EMAIL_DOMAIN} email address`;
};

