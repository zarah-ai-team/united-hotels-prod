// pino logger. Pretty-prints in dev, JSON in prod. Tag every line with
// the service name so logs are easy to filter when this runs alongside
// the main app under a single PM2 / docker-compose group.

import pino from 'pino';

const isDev = (process.env.NODE_ENV || 'development') !== 'production';

export const log = pino({
  name: 'pricing-engine-v2',
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname,name',
        },
      }
    : undefined,
});

export default log;
