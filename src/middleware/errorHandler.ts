import type { NextFunction, Request, Response } from 'express';
import { logger } from '../config/logger.js';

export class AppError extends Error {
  public constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    correlationId: req.correlationId,
  });
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const correlationId = req.correlationId ?? 'unknown';
  const log = req.log ?? logger;

  if (err instanceof AppError) {
    log.warn({ err, correlationId, details: err.details }, err.message);
    res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
      correlationId,
    });
    return;
  }

  log.error({ err, correlationId }, 'Unhandled error');
  res.status(500).json({
    error: 'Internal Server Error',
    correlationId,
  });
}
