// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Check if user is HR or admin
const isHRorAdmin = (req, res, next) => {
  if (!['hr', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'HR or Admin access required' });
  }
  next();
};

// Check if user is CEO or admin
const isCEOorAdmin = (req, res, next) => {
  if (!['ceo', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'CEO or Admin access required' });
  }
  next();
};

// Check if user is accessing their own data or has higher privileges
const isSelfOrHigher = (req, res, next) => {
  const targetUserId = req.params.id || req.body.userId;
  
  if (req.user.role === 'admin' || req.user.role === 'ceo') {
    return next();
  }
  
  if (req.user.role === 'hr' && targetUserId) {
    // HR can access employee data
    return next();
  }
  
  if (req.user.id === targetUserId) {
    return next();
  }
  
  return res.status(403).json({ message: 'Access denied' });
};

module.exports = {
  isAdmin,
  isHRorAdmin,
  isCEOorAdmin,
  isSelfOrHigher
};