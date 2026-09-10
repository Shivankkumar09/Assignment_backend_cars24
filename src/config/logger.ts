import { pino, type Logger } from 'pino';
import { env } from './env.js';

export const logger: Logger = pino({
  level: env.logLevel,
  base: { service: 'cars24-ops-copilot' },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(env.nodeEnv === 'development'
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      }
    : {}),
});

export function childLogger(bindings: Record<string, string>): Logger {
  return logger.child(bindings);
}
