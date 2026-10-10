const authConfig = require('../config/auth');

const getJwtSecret = () => {
  const configuredSecret = process.env.JWT_SECRET?.trim();

  if (configuredSecret) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.warn('JWT_SECRET is not set. Falling back to the development secret configured in src/config/auth.js');
  }

  return authConfig.jwt.secret;
};

module.exports = {
  getJwtSecret,
};
