import type { Logger } from 'pino';
import type { ToolExecutionRecord } from '../types/index.js';
import { opsService } from '../services/opsService.js';
import { parseOrderIdArgs, TOOL_NAMES } from './toolDefinitions.js';

/**
 * Executes a single Gemini function call against SQLite via OpsService.
 * Invalid JSON / unknown tools fail closed with a structured error the model can read.
 */
export function executeTool(
  name: string,
  args: Record<string, unknown>,
  log: Logger,
): ToolExecutionRecord {
  const started = Date.now();
  try {
    const parsed = parseOrderIdArgs(args);
    switch (name) {
      case TOOL_NAMES.GET_ORDER_STATUS: {
        const result = opsService.getOrderStatus(parsed.orderId);
        return { name, args: parsed, ok: true, durationMs: Date.now() - started, result };
      }
      case TOOL_NAMES.GET_PAYMENT_DETAILS: {
        const result = opsService.getPaymentDetails(parsed.orderId);
        return { name, args: parsed, ok: true, durationMs: Date.now() - started, result };
      }
      case TOOL_NAMES.GET_DELIVERY_LOGS: {
        const result = opsService.getDeliveryLogs(parsed.orderId);
        return { name, args: parsed, ok: true, durationMs: Date.now() - started, result };
      }
      default: {
        log.warn({ name }, 'Unknown tool requested by model');
        return {
          name,
          args,
          ok: false,
          durationMs: Date.now() - started,
          result: { error: `Unknown tool: ${name}` },
        };
      }
    }
  } catch (error) {
    log.error({ err: error, name, args }, 'Tool execution failed');
    return {
      name,
      args,
      ok: false,
      durationMs: Date.now() - started,
      result: { error: error instanceof Error ? error.message : 'Tool execution failed' },
    };
  }
}
