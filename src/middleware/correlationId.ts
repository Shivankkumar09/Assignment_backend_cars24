import type { NextFunction, Request, Response } from 'express';
import { childLogger } from '../config/logger.js';

const HEADER = 'x-correlation-id';

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header(HEADER);
  const correlationId = incoming && incoming.trim().length > 0 ? incoming.trim() : crypto.randomUUID();
  req.correlationId = correlationId;
  req.log = childLogger({ correlationId, method: req.method, path: req.path });
  res.setHeader(HEADER, correlationId);
  next();
}
