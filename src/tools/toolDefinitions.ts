import { Type, type FunctionDeclaration } from '@google/genai';
import { z } from 'zod';

export const TOOL_NAMES = {
  GET_ORDER_STATUS: 'get_order_status',
  GET_PAYMENT_DETAILS: 'get_payment_details',
  GET_DELIVERY_LOGS: 'get_delivery_logs',
} as const;

export type ToolName = (typeof TOOL_NAMES)[keyof typeof TOOL_NAMES];

export const orderIdSchema = z.object({
  orderId: z
    .string()
    .min(1)
    .describe('Cars24 order identifier, e.g. C24-ORD-1001'),
});

export type OrderIdArgs = z.infer<typeof orderIdSchema>;

export const geminiFunctionDeclarations: FunctionDeclaration[] = [
  {
    name: TOOL_NAMES.GET_ORDER_STATUS,
    description:
      'Look up an order by ID. Returns vehicle, customer, order status, latest payment status, delivery status, and operational blockers.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        orderId: {
          type: Type.STRING,
          description: 'Cars24 order identifier such as C24-ORD-1001',
        },
      },
      required: ['orderId'],
    },
  },
  {
    name: TOOL_NAMES.GET_PAYMENT_DETAILS,
    description:
      'Return every payment attempt for an order, including failures, pending captures, refunds, gateways, and transaction references.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        orderId: {
          type: Type.STRING,
          description: 'Cars24 order identifier such as C24-ORD-1001',
        },
      },
      required: ['orderId'],
    },
  },
  {
    name: TOOL_NAMES.GET_DELIVERY_LOGS,
    description:
      'Return the delivery record and chronological tracking logs for an order, including delays and failed attempts.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        orderId: {
          type: Type.STRING,
          description: 'Cars24 order identifier such as C24-ORD-1001',
        },
      },
      required: ['orderId'],
    },
  },
];

export function parseOrderIdArgs(raw: Record<string, unknown>): OrderIdArgs {
  return orderIdSchema.parse(raw);
}
