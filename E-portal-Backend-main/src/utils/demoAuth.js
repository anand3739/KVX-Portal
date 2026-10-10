const DEMO_USERS = {
  'admin@kravix.com': {
    id: 'demo-admin',
    employee_id: 'ADMIN001',
    email: 'admin@kravix.com',
    password: 'Admin@123',
    role: 'admin',
    first_name: 'Admin',
    last_name: 'User',
    department: 'Administration',
    department_id: null,
    position: 'System Administrator',
    status: 'active',
    profile_picture: null,
  },
  'hr@kravix.com': {
    id: 'demo-hr',
    employee_id: 'HR001',
    email: 'hr@kravix.com',
    password: 'HR@123',
    role: 'hr',
    first_name: 'HR',
    last_name: 'Manager',
    department: 'Human Resources',
    department_id: null,
    position: 'HR Manager',
    status: 'active',
    profile_picture: null,
  },
  'ceo@kravix.com': {
    id: 'demo-ceo',
    employee_id: 'CEO001',
    email: 'ceo@kravix.com',
    password: 'CEO@123',
    role: 'ceo',
    first_name: 'Sarah',
    last_name: 'CEO',
    department: 'Executive',
    department_id: null,
    position: 'Chief Executive Officer',
    status: 'active',
    profile_picture: null,
  },
  'employee@kravix.com': {
    id: 'demo-employee',
    employee_id: 'EMP001',
    email: 'employee@kravix.com',
    password: 'Emp@123',
    role: 'employee',
    first_name: 'John',
    last_name: 'Employee',
    department: 'Operations',
    department_id: null,
    position: 'Employee',
    status: 'active',
    profile_picture: null,
  },
};

const DEMO_TOKEN_SOURCE = 'demo';

const getDemoUserRecord = (email) => {
  if (!email) {
    return null;
  }

  return DEMO_USERS[String(email).trim().toLowerCase()] || null;
};

const sanitizeDemoUser = (demoUser) => {
  if (!demoUser) {
    return null;
  }

  return {
    id: demoUser.id,
    employee_id: demoUser.employee_id,
    email: demoUser.email,
    role: demoUser.role,
    first_name: demoUser.first_name,
    last_name: demoUser.last_name,
    department: demoUser.department,
    department_id: demoUser.department_id,
    position: demoUser.position,
    profile_picture: demoUser.profile_picture,
    status: demoUser.status,
    auth_source: DEMO_TOKEN_SOURCE,
  };
};

const getDemoUserByEmail = (email) => sanitizeDemoUser(getDemoUserRecord(email));

const isDemoCredentialMatch = (email, password) => {
  const demoUser = getDemoUserRecord(email);
  return Boolean(demoUser && demoUser.password === password);
};

const isDatabaseConnectivityError = (error) => {
  const transientCodes = ['ENOTFOUND', 'EAI_AGAIN', 'ECONNREFUSED', 'ETIMEDOUT'];
  return transientCodes.includes(error?.code);
};

const canUseDemoAuthFallback = (error, email, password) => {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }

  return isDatabaseConnectivityError(error) && isDemoCredentialMatch(email, password);
};

const createDemoTokenPayload = (demoUser) => ({
  id: demoUser.id,
  email: demoUser.email,
  role: demoUser.role,
  employee_id: demoUser.employee_id,
  first_name: demoUser.first_name,
  last_name: demoUser.last_name,
  auth_source: DEMO_TOKEN_SOURCE,
});

const isDemoTokenPayload = (decodedToken) => decodedToken?.auth_source === DEMO_TOKEN_SOURCE;

const getDemoUserFromToken = (decodedToken) => {
  if (!isDemoTokenPayload(decodedToken)) {
    return null;
  }

  return getDemoUserByEmail(decodedToken.email);
};

module.exports = {
  canUseDemoAuthFallback,
  createDemoTokenPayload,
  getDemoUserByEmail,
  getDemoUserFromToken,
  isDemoTokenPayload,
};
