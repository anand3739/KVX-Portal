/**
 * Form Validation and Input Sanitization Utilities
 * Implements strict validations for Careers, Contact, and Newsletter forms
 */

/**
 * Validates phone numbers:
 * - Rejects any letters or alphanumeric characters (TS-259, TS-260)
 * - Rejects invalid special characters (TS-261)
 * - Allows optional leading + and digits with standard formatting (spaces, dashes, parens)
 * - Requires 10 to 15 digits
 */
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: "Phone number is required" };
  }
  const trimmed = phone.trim();
  
  if (!trimmed) {
    return { isValid: false, error: "Phone number is required" };
  }

  // Reject if contains any alphabetic characters (TS-259, TS-260)
  if (/[a-zA-Z]/.test(trimmed)) {
    return { isValid: false, error: "Phone number cannot contain letters or alphanumeric characters" };
  }

  // Reject invalid special characters (TS-261)
  if (/[^0-9+\s\-()]/.test(trimmed)) {
    return { isValid: false, error: "Phone number contains invalid special characters" };
  }

  // Count actual digits
  const digitCount = (trimmed.match(/\d/g) || []).length;
  if (digitCount < 10) {
    return { isValid: false, error: "Phone number is too short (minimum 10 digits required)" };
  }
  if (digitCount > 15) {
    return { isValid: false, error: "Phone number is too long (maximum 15 digits allowed)" };
  }

  return { isValid: true, error: null };
};

/**
 * Validates resume URLs:
 * - Rejects URLs containing whitespace (TS-268)
 * - Ensures valid http:// or https:// protocol
 */
export const validateResumeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: "Resume URL is required" };
  }
  const trimmed = url.trim();

  if (!trimmed) {
    return { isValid: false, error: "Resume URL is required" };
  }

  // Reject spaces anywhere in the URL (TS-268)
  if (/\s/.test(trimmed)) {
    return { isValid: false, error: "Resume URL cannot contain spaces" };
  }

  // Valid URL pattern
  const urlPattern = /^https?:\/\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=]+$/i;
  if (!urlPattern.test(trimmed)) {
    return { isValid: false, error: "Please enter a valid URL starting with http:// or https://" };
  }

  return { isValid: true, error: null };
};

/**
 * Validates Full Name:
 * - Rejects numeric-only names (TS-318)
 * - Ensures name contains alphabetic characters
 */
export const validateFullName = (name) => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: "Full Name is required" };
  }
  const trimmed = name.trim();

  if (!trimmed) {
    return { isValid: false, error: "Full Name is required" };
  }

  // Reject purely numeric or number-dominant names (TS-318)
  if (/^\d+$/.test(trimmed) || !/[a-zA-Z]/.test(trimmed)) {
    return { isValid: false, error: "Name must contain letters and cannot be numeric-only" };
  }

  if (trimmed.length < 2) {
    return { isValid: false, error: "Name must be at least 2 characters long" };
  }

  return { isValid: true, error: null };
};

/**
 * Validates Email Address:
 * - Rejects emails without Top-Level Domain (e.g. user@domain) (TS-322)
 * - Rejects emails with whitespace
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: "Email address is required" };
  }
  const trimmed = email.trim();

  if (!trimmed) {
    return { isValid: false, error: "Email address is required" };
  }

  if (/\s/.test(trimmed)) {
    return { isValid: false, error: "Email cannot contain spaces" };
  }

  // Strict email regex requiring @ and valid 2+ character TLD (TS-322)
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailPattern.test(trimmed)) {
    return { isValid: false, error: "Please enter a valid email address with a valid domain (e.g. user@domain.com)" };
  }

  return { isValid: true, error: null };
};

/**
 * TS-334: Mailto link handler
 */
export const openMailClient = (email = "info@kravixtech.com", subject = "Inquiry") => {
  window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}`;
};
