module.exports = {
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: '8h',
    refreshExpiresIn: '7d'
  },
  
  // Password configuration
  password: {
    saltRounds: 10,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  
  // Session configuration
  session: {
    maxAge: 8 * 60 * 60 * 1000 // 8 hours
  }
};