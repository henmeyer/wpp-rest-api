import pino from 'pino';

// Create a logging instance
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
    },
  },
  formatters: {
    level: label => {
      return { level: label };
    },
  },
  level: 'info',
});

export default logger;
