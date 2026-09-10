/**
 * Domain types for the Cars24 Operations Copilot.
 * These interfaces map 1:1 to SQLite rows plus API-facing aggregates.
 */

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'ready_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cash';

export type PaymentGateway = 'razorpay' | 'payu' | 'cash';

export type DeliveryStatus =
  | 'unscheduled'
  | 'scheduled'
  | 'in_transit'
  | 'delayed'
  | 'delivered'
  | 'failed';

export type ChatRole = 'user' | 'assistant' | 'system' | 'tool';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  status: OrderStatus;
  amountInr: number;
  deliveryAddress: string | null;
  addressVerified: boolean;
  city: string | null;
  pincode: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  gateway: PaymentGateway;
  status: PaymentStatus;
  amountInr: number;
  method: PaymentMethod;
  transactionRef: string | null;
  failureReason: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  status: DeliveryStatus;
  carrier: string | null;
  trackingNumber: string | null;
  scheduledAt: string | null;
  eta: string | null;
  delayReason: string | null;
  createdAt: string;
}

export interface DeliveryLog {
  id: string;
  deliveryId: string;
  eventType: string;
  message: string;
  location: string | null;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  agentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: ChatRole;
  content: string;
  toolInvocations: ToolExecutionRecord[] | null;
  createdAt: string;
}

/** Payload the LLM emits when requesting a tool. */
export interface ToolCallPayload {
  name: string;
  args: Record<string, unknown>;
}

/** Result of a single tool invocation, persisted on the assistant turn. */
export interface ToolExecutionRecord {
  name: string;
  args: Record<string, unknown>;
  ok: boolean;
  durationMs: number;
  result: unknown;
}

export interface OrderStatusView {
  found: boolean;
  order: Order | null;
  latestPaymentStatus: PaymentStatus | null;
  latestDeliveryStatus: DeliveryStatus | null;
  blockers: string[];
}

export interface PaymentDetailsView {
  found: boolean;
  orderId: string;
  payments: Payment[];
}

export interface DeliveryLogsView {
  found: boolean;
  orderId: string;
  delivery: Delivery | null;
  logs: DeliveryLog[];
}

export interface CopilotChatRequest {
  message: string;
  sessionId?: string;
  agentId?: string;
}

export interface CopilotChatResponse {
  sessionId: string;
  answer: string;
  toolInvocations: ToolExecutionRecord[];
  loopCount: number;
  truncated: boolean;
}

export interface HealthStatus {
  status: 'ok' | 'degraded';
  service: string;
  uptimeSeconds: number;
  database: 'connected' | 'unavailable';
  model: string;
  correlationId: string;
}
