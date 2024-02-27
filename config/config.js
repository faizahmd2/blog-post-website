module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 2900,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/my_database",
  RATE_LIMIT: process.env.RATE_LIMIT || 100,
  EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET || "random$ecret",
  BASE_URL: process.env.BASE_URL || "http://localhost:2900"
};