export default () => ({
  port: isNaN(parseInt(process.env.PORT ?? '', 10))
    ? 3000
    : parseInt(process.env.PORT ?? '', 10),
  nodeEnv:
    process.env.NODE_ENV && process.env.NODE_ENV !== ''
      ? process.env.NODE_ENV
      : 'test',
  database: {
    host:
      process.env.DATABASE_HOST && process.env.DATABASE_HOST !== ''
        ? process.env.DATABASE_HOST
        : 'localhost',
    port: isNaN(parseInt(process.env.DATABASE_PORT ?? '', 10))
      ? 5432
      : parseInt(process.env.DATABASE_PORT ?? '', 10),
    username:
      process.env.DATABASE_USERNAME && process.env.DATABASE_USERNAME !== ''
        ? process.env.DATABASE_USERNAME
        : 'postgres',
    password:
      process.env.DATABASE_PASSWORD && process.env.DATABASE_PASSWORD !== ''
        ? process.env.DATABASE_PASSWORD
        : 'password',
    name:
      process.env.DATABASE_NAME && process.env.DATABASE_NAME !== ''
        ? process.env.DATABASE_NAME
        : 'database_app',
  },
  jwt: {
    secret:
      process.env.JWT_SECRET && process.env.JWT_SECRET !== ''
        ? process.env.JWT_SECRET
        : 'your-secret-key',
    expiresIn:
      process.env.JWT_EXPIRES_IN && process.env.JWT_EXPIRES_IN !== ''
        ? process.env.JWT_EXPIRES_IN
        : '1d',
  },
  logging: {
    level:
      process.env.LOG_LEVEL && process.env.LOG_LEVEL !== ''
        ? process.env.LOG_LEVEL
        : 'info',
    maxFiles:
      process.env.LOG_MAX_FILES && process.env.LOG_MAX_FILES !== ''
        ? process.env.LOG_MAX_FILES
        : '14d',
    maxSize:
      process.env.LOG_MAX_SIZE && process.env.LOG_MAX_SIZE !== ''
        ? process.env.LOG_MAX_SIZE
        : '20m',
    timezone:
      process.env.LOG_TIMEZONE && process.env.LOG_TIMEZONE !== ''
        ? process.env.LOG_TIMEZONE
        : 'Europe/Rome',
  },
});
