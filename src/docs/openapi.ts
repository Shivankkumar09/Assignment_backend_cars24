import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const chatRequestSchema = z
  .object({
    message: z.string().min(1).max(4000).openapi({ example: 'What is blocking delivery for C24-ORD-1002?' }),
    sessionId: z.string().uuid().optional().openapi({ example: '8f3c2a1e-4b7d-4d2a-9c11-2e0a1b4c5d6e' }),
    agentId: z.string().min(1).max(120).optional().openapi({ example: 'agent.ops.gurgaon.12' }),
  })
  .openapi('CopilotChatRequest');

export const chatResponseSchema = z
  .object({
    sessionId: z.string(),
    answer: z.string(),
    toolInvocations: z.array(
      z.object({
        name: z.string(),
        args: z.record(z.unknown()),
        ok: z.boolean(),
        durationMs: z.number(),
        result: z.unknown(),
      }),
    ),
    loopCount: z.number().int(),
    truncated: z.boolean(),
  })
  .openapi('CopilotChatResponse');

export const healthResponseSchema = z
  .object({
    status: z.enum(['ok', 'degraded']),
    service: z.string(),
    uptimeSeconds: z.number(),
    database: z.enum(['connected', 'unavailable']),
    model: z.string(),
    correlationId: z.string(),
  })
  .openapi('HealthStatus');

const registry = new OpenAPIRegistry();

registry.register('CopilotChatRequest', chatRequestSchema);
registry.register('CopilotChatResponse', chatResponseSchema);
registry.register('HealthStatus', healthResponseSchema);

registry.registerPath({
  method: 'post',
  path: '/api/v1/copilot/chat',
  summary: 'Ask the operations copilot',
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: chatRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Grounded copilot answer',
      content: { 'application/json': { schema: chatResponseSchema } },
    },
    400: { description: 'Validation error' },
    500: { description: 'Server error' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/copilot/health',
  summary: 'Liveness and dependency check',
  responses: {
    200: {
      description: 'Health payload',
      content: { 'application/json': { schema: healthResponseSchema } },
    },
  },
});

export function buildOpenApiDocument(): ReturnType<OpenApiGeneratorV31['generateDocument']> {
  const generator = new OpenApiGeneratorV31(registry.definitions);
  return generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'Cars24 Operations Copilot',
      version: '1.0.0',
      description: 'Internal API for order, payment, and delivery assistance.',
    },
    servers: [{ url: 'http://localhost:3000' }],
  });
}
