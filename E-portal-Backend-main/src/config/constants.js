module.exports = {
  // User roles
  ROLES: {
    ADMIN: 'admin',
    HR: 'hr',
    CEO: 'ceo',
    EMPLOYEE: 'employee'
  },
  
  // Employee status
  EMPLOYEE_STATUS: {
    ACTIVE: 'active',
    PROBATION: 'probation',
    INACTIVE: 'inactive',
    RESIGNED: 'resigned',
    TERMINATED: 'terminated'
  },
  
  // Employment types
  EMPLOYMENT_TYPES: {
    FULL_TIME: 'full-time',
    PART_TIME: 'part-time',
    CONTRACT: 'contract',
    INTERN: 'intern'
  },
  
  // Leave types
  LEAVE_TYPES: {
    ANNUAL: 'annual',
    SICK: 'sick',
    PERSONAL: 'personal',
    MATERNITY: 'maternity',
    PATERNITY: 'paternity',
    UNPAID: 'unpaid',
    BEREAVEMENT: 'bereavement',
    MARRIAGE: 'marriage'
  },
  
  // Leave status
  LEAVE_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled'
  },
  
  // Attendance status
  ATTENDANCE_STATUS: {
    PRESENT: 'present',
    ABSENT: 'absent',
    LATE: 'late',
    HALF_DAY: 'half-day',
    WFH: 'wfh',
    HOLIDAY: 'holiday',
    LEAVE: 'leave'
  },
  
  // Document categories
  DOCUMENT_CATEGORIES: {
    ID_PROOF: 'id-proof',
    ADDRESS_PROOF: 'address-proof',
    EDUCATION: 'education',
    CERTIFICATION: 'certification',
    CONTRACT: 'contract',
    PAYSLIP: 'payslip',
    TAX: 'tax',
    ONBOARDING: 'onboarding',
    OTHER: 'other'
  },
  
  // Document status
  DOCUMENT_STATUS: {
    PENDING: 'pending',
    VERIFIED: 'verified',
    REJECTED: 'rejected'
  },
  
  // Notification types
  NOTIFICATION_TYPES: {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
    TASK: 'task',
    LEAVE: 'leave',
    DOCUMENT: 'document',
    PAYROLL: 'payroll'
  },
  
  // Task priority
  TASK_PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
  },
  
  // Task status
  TASK_STATUS: {
    PENDING: 'pending',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    ON_HOLD: 'on-hold'
  },
  
  // Job posting status
  JOB_STATUS: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    CLOSED: 'closed',
    ON_HOLD: 'on-hold'
  },
  
  // Application status
  APPLICATION_STATUS: {
    APPLIED: 'applied',
    SHORTLISTED: 'shortlisted',
    INTERVIEWED: 'interviewed',
    OFFERED: 'offered',
    HIRED: 'hired',
    REJECTED: 'rejected'
  },
  
  // Payroll status
  PAYROLL_STATUS: {
    PENDING: 'pending',
    PROCESSED: 'processed',
    PAID: 'paid',
    CANCELLED: 'cancelled'
  },
  
  // Performance review types
  REVIEW_TYPES: {
    QUARTERLY: 'quarterly',
    ANNUAL: 'annual',
    PROBATION: 'probation',
    PROMOTION: 'promotion'
  },
  
  // Default leave balances
  DEFAULT_LEAVE_BALANCE: {
    annual: 20,
    sick: 10,
    personal: 5,
    bereavement: 3,
    marriage: 5
  },
  
  // Working hours
  WORKING_HOURS: {
    START: '09:00',
    END: '18:00',
    HOURS_PER_DAY: 8,
    LATE_THRESHOLD: 15 // minutes
  },
  
  // File upload
  UPLOAD: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    PATHS: {
      DOCUMENTS: 'uploads/documents',
      PROFILES: 'uploads/profiles',
      PAYSLIPS: 'uploads/payslips'
    }
  }
};