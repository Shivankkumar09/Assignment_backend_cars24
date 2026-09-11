import type { Request, Response } from 'express';
import { env } from '../config/env.js';
import { opsService } from '../services/opsService.js';
import { CopilotEngine } from '../services/copilotEngine.js';
import { AppError } from '../middleware/errorHandler.js';
import { chatRequestSchema } from '../docs/openapi.js';
import type { HealthStatus } from '../types/index.js';
import { cleanCopilotResponse } from '../utils/cleaner.js';

const startedAt = Date.now();
const engineByProcess = new Map<string, CopilotEngine>();

function engineFor(req: Request): CopilotEngine {
  const existing = engineByProcess.get('default');
  if (existing) {
    return existing;
  }
  const engine = new CopilotEngine(req.log);
  engineByProcess.set('default', engine);
  return engine;
}

export async function chatHandler(req: Request, res: Response): Promise<void> {
  const parsed = chatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'Invalid chat request', parsed.error.flatten());
  }

  if (!env.geminiApiKey) {
    throw new AppError(503, 'GEMINI_API_KEY is not configured');
  }

  const agentId = parsed.data.agentId ?? 'ops-agent-anonymous';
  const session = opsService.getOrCreateSession(parsed.data.sessionId, agentId);
  const now = new Date().toISOString();

  opsService.appendMessage({
    id: crypto.randomUUID(),
    sessionId: session.id,
    role: 'user',
    content: parsed.data.message,
    toolInvocations: null,
    createdAt: now,
  });

  const result = await engineFor(req).chat(parsed.data.message, session.id, req.correlationId);
  result.answer = cleanCopilotResponse(result.answer);

  opsService.appendMessage({
    id: crypto.randomUUID(),
    sessionId: session.id,
    role: 'assistant',
    content: result.answer,
    toolInvocations: result.toolInvocations,
    createdAt: new Date().toISOString(),
  });

  req.log.info(
    {
      sessionId: session.id,
      loopCount: result.loopCount,
      toolCount: result.toolInvocations.length,
      truncated: result.truncated,
    },
    'Copilot chat completed',
  );

  res.status(200).json(result);
}

export function healthHandler(req: Request, res: Response): void {
  const dbOk = opsService.ping();
  const payload: HealthStatus = {
    status: dbOk ? 'ok' : 'degraded',
    service: 'cars24-ops-copilot',
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    database: dbOk ? 'connected' : 'unavailable',
    model: env.geminiModel,
    correlationId: req.correlationId,
  };
  res.status(dbOk ? 200 : 503).json(payload);
}
