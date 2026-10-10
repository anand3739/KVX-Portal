// src/middleware/auth.js

const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { getDemoUserFromToken, isDemoTokenPayload } = require('../utils/demoAuth');
const { getJwtSecret } = require('../utils/jwt');
const { requirePermission } = require('./permissionMiddleware');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, getJwtSecret());

    if (isDemoTokenPayload(decoded)) {
      const demoUser = getDemoUserFromToken(decoded);
      if (!demoUser) {
        throw new Error();
      }
      req.user = demoUser;
      req.token = token;
      return next();
    }
    
    // Get user with permissions using the new table structure
    const result = await query(
      `SELECT e.*, d.name as department_name,
        array_agg(p.code) FILTER (WHERE p.code IS NOT NULL) as permissions
       FROM employees e 
       LEFT JOIN departments d ON e.department_id = d.id 
       LEFT JOIN permissions p ON e.role = p.category
       WHERE e.id = $1 AND e.status IN ('active', 'probation')
       GROUP BY e.id, d.name`,
      [decoded.id]
    );

    const user = result.rows[0];

    if (!user) {
      throw new Error();
    }

    // ⭐ DEBUG: Log user permissions (remove in production)
    console.log('🔍 ===== USER PERMISSIONS DEBUG =====');
    console.log('User ID:', user.id);
    console.log('User Email:', user.email);
    console.log('User Role:', user.role);
    console.log('Permissions Count:', user.permissions?.length || 0);
    console.log('Permissions:', user.permissions);
    console.log('Has employees.view:', user.permissions?.includes('employees.view'));
    console.log('Has attendance.view:', user.permissions?.includes('attendance.view'));
    console.log('Has leaves.view:', user.permissions?.includes('leaves.view'));
    console.log('Has recruitment.view:', user.permissions?.includes('recruitment.view'));
    console.log('Has payroll.view:', user.permissions?.includes('payroll.view'));
    console.log('=====================================');

    // Remove sensitive data
    delete user.password_hash;
    delete user.password_encrypted;
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Your session has expired. Please log in again.', 
        code: 'SESSION_EXPIRED' 
      });
    }
    console.error('❌ Auth error:', error.message);
    res.status(401).json({ message: 'Please authenticate' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. You do not have permission to access this resource.' 
      });
    }
    next();
  };
};

const isSelfOrHigher = (req, res, next) => {
  const targetUserId = req.params.id || req.body.userId;
  
  // Admin and CEO can access everything
  if (req.user.role === 'admin' || req.user.role === 'ceo') {
    return next();
  }
  
  // HR can access employee data
  if (req.user.role === 'hr' && targetUserId) {
    return next();
  }
  
  // Users can access their own data
  if (req.user.id === targetUserId) {
    return next();
  }
  
  return res.status(403).json({ 
    message: 'Access denied. You can only access your own data.' 
  });
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, getJwtSecret());

      if (isDemoTokenPayload(decoded)) {
        req.user = getDemoUserFromToken(decoded);
        return next();
      }

      const result = await query(
        `SELECT id, role, email FROM employees WHERE id = $1`,
        [decoded.id]
      );
      if (result.rows[0]) {
        req.user = result.rows[0];
      }
    }
    next();
  } catch (error) {
    console.error('Optional auth error:', error.message);
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  requirePermission, // ⭐ Make sure this is exported
  isSelfOrHigher,
  optionalAuth
};