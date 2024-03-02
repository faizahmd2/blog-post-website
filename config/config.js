module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 2900,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/my_database",
  RATE_LIMIT: process.env.RATE_LIMIT || 100,
  BASE_URL: process.env.BASE_URL || "http://localhost:2900",
  JWT_SECRET: process.env.JWT_SECRET || "jwt$ecret",
  JWT_EXPIRY: process.env.JWT_EXPIRY && `${process.env.JWT_EXPIRY}hr` || '1hr',
  LOGIN_COOKIE_EXPIRY: process.env.JWT_EXPIRY && (process.env.JWT_EXPIRY * 60 * 60 * 1000) || (24 *60 * 60 * 1000)
};