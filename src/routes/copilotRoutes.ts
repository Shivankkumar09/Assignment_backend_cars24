import { Router } from 'express';
import { chatHandler, healthHandler } from '../controllers/copilotController.js';

export const copilotRouter = Router();

copilotRouter.post('/chat', (req, res, next) => {
  void chatHandler(req, res).catch(next);
});

copilotRouter.get('/health', healthHandler);
