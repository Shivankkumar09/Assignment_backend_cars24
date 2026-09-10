import cors from 'cors';
import express, { type Express, type Request } from 'express';
import { pinoHttp } from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { getDatabase } from './db/database.js';
import { buildOpenApiDocument } from './docs/openapi.js';
import { correlationIdMiddleware } from './middleware/correlationId.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { copilotRouter } from './routes/copilotRoutes.js';
import { assertGeminiConfigured } from './config/env.js';

assertGeminiConfigured();

export function createApp(): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors());
  app.use(express.json({ limit: '64kb' }));
  app.use(correlationIdMiddleware);
  app.use(
    pinoHttp({
      logger,
      customProps: (req: Request) => ({ correlationId: req.correlationId }),
    }),
  );

  const openApi = buildOpenApiDocument();
  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(openApi));
  app.get('/api/v1/openapi.json', (_req, res) => {
    res.json(openApi);
  });

  app.use('/api/v1/copilot', copilotRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

export function bootstrap(): void {
  getDatabase();
  const app = createApp();
  app.listen(env.port, () => {
    logger.info({ port: env.port, docs: `http://localhost:${env.port}/api/v1/docs` }, 'Ops Copilot listening');
  });
}

const isDirectRun = process.argv[1]?.includes('server.ts') || process.argv[1]?.includes('server.js');
if (isDirectRun) {
  bootstrap();
}
