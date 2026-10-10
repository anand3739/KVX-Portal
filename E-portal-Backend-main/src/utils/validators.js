const { body, param, query } = require('express-validator');
const moment = require('moment');

const validateEmail = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address');

const validatePassword = body('password')
  .isLength({ min: 8 })
  .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
  .withMessage('Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character');

const validateName = (field) => body(field)
  .notEmpty()
  .trim()
  .isLength({ min: 2, max: 50 })
  .withMessage(`${field} must be between 2 and 50 characters`);

const validatePhone = body('phone')
  .optional()
  .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/)
  .withMessage('Please provide a valid phone number');

const validateDate = (field) => body(field)
  .optional()
  .isISO8601()
  .withMessage(`Please provide a valid date for ${field}`);

const validateFutureDate = (field) => body(field)
  .optional()
  .custom((value) => {
    if (value && moment(value).isBefore(moment().startOf('day'))) {
      throw new Error(`${field} must be today or in the future`);
    }
    return true;
  });

const validatePastDate = (field) => body(field)
  .optional()
  .custom((value) => {
    if (value && moment(value).isAfter(moment().endOf('day'))) {
      throw new Error(`${field} must be today or in the past`);
    }
    return true;
  });

const validateUUID = (field) => param(field).isUUID().withMessage(`Invalid ${field} format`);

const validateId = (field) => param(field).isUUID().withMessage('Invalid ID format');

const validateRole = body('role')
  .optional()
  .isIn(['admin', 'hr', 'ceo', 'employee'])
  .withMessage('Invalid role');

const validateStatus = body('status')
  .optional()
  .isIn(['active', 'probation', 'inactive', 'resigned', 'terminated'])
  .withMessage('Invalid status');

const validateLeaveType = body('leave_type')
  .isIn(['annual', 'sick', 'personal', 'maternity', 'paternity', 'unpaid', 'bereavement', 'marriage'])
  .withMessage('Invalid leave type');

const validateLeaveDates = [
  body('start_date').isISO8601().withMessage('Invalid start date'),
  body('end_date').isISO8601().withMessage('Invalid end date')
    .custom((endDate, { req }) => {
      if (moment(endDate).isBefore(moment(req.body.start_date))) {
        throw new Error('End date must be after start date');
      }
      return true;
    })
];

const validateDocumentCategory = body('category')
  .isIn(['id-proof', 'address-proof', 'education', 'certification', 'contract', 'payslip', 'tax', 'onboarding', 'other'])
  .withMessage('Invalid document category');

const validatePriority = body('priority')
  .optional()
  .isIn(['low', 'medium', 'high', 'urgent'])
  .withMessage('Invalid priority');

const validateTaskStatus = body('status')
  .optional()
  .isIn(['pending', 'in-progress', 'completed', 'cancelled', 'on-hold'])
  .withMessage('Invalid task status');

const validateSalary = body('salary')
  .optional()
  .isFloat({ min: 0 })
  .withMessage('Salary must be a positive number');

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateDate,
  validateFutureDate,
  validatePastDate,
  validateUUID,
  validateId,
  validateRole,
  validateStatus,
  validateLeaveType,
  validateLeaveDates,
  validateDocumentCategory,
  validatePriority,
  validateTaskStatus,
  validateSalary,
  validatePagination
};