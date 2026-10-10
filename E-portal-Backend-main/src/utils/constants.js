module.exports = {
  // Success messages
  SUCCESS: {
    LOGIN: 'Login successful',
    LOGOUT: 'Logout successful',
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    CLOCK_IN: 'Clocked in successfully',
    CLOCK_OUT: 'Clocked out successfully',
    LEAVE_APPLIED: 'Leave request submitted successfully',
    DOCUMENT_UPLOADED: 'Document uploaded successfully',
    DOCUMENT_VERIFIED: 'Document verified successfully',
    MESSAGE_SENT: 'Message sent successfully',
    PASSWORD_CHANGED: 'Password changed successfully',
    EMAIL_SENT: 'Email sent successfully'
  },

  // Error messages
  ERROR: {
    NOT_FOUND: 'Resource not found',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access denied',
    VALIDATION: 'Validation error',
    SERVER: 'Internal server error',
    INVALID_CREDENTIALS: 'Invalid email or password',
    ACCOUNT_INACTIVE: 'Account is not active',
    EMAIL_EXISTS: 'Email already exists',
    ALREADY_CLOCKED_IN: 'Already clocked in today',
    NOT_CLOCKED_IN: 'No clock-in found for today',
    ALREADY_CLOCKED_OUT: 'Already clocked out today',
    LEAVE_BALANCE_EXCEEDED: 'Insufficient leave balance',
    DOCUMENT_NOT_FOUND: 'Document not found',
    MESSAGE_NOT_FOUND: 'Message not found',
    INVALID_TOKEN: 'Invalid token',
    TOKEN_EXPIRED: 'Token expired',
    NETWORK_ERROR: 'Network error occurred'
  },

  // HTTP status codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    VALIDATION_ERROR: 422,
    SERVER_ERROR: 500
  }
};