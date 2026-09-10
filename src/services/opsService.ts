import type {
  ChatMessage,
  ChatSession,
  Delivery,
  DeliveryLog,
  DeliveryLogsView,
  DeliveryStatus,
  Order,
  OrderStatus,
  OrderStatusView,
  Payment,
  PaymentDetailsView,
  PaymentGateway,
  PaymentMethod,
  PaymentStatus,
} from '../types/index.js';
import { getDatabase } from '../db/database.js';

interface OrderRow {
  id: string;
  customer_name: string;
  customer_phone: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  status: string;
  amount_inr: number;
  delivery_address: string | null;
  address_verified: number;
  city: string | null;
  pincode: string | null;
  created_at: string;
}

interface PaymentRow {
  id: string;
  order_id: string;
  gateway: string;
  status: string;
  amount_inr: number;
  method: string;
  transaction_ref: string | null;
  failure_reason: string | null;
  paid_at: string | null;
  created_at: string;
}

interface DeliveryRow {
  id: string;
  order_id: string;
  status: string;
  carrier: string | null;
  tracking_number: string | null;
  scheduled_at: string | null;
  eta: string | null;
  delay_reason: string | null;
  created_at: string;
}

interface DeliveryLogRow {
  id: string;
  delivery_id: string;
  event_type: string;
  message: string;
  location: string | null;
  created_at: string;
}

function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    vehicleMake: row.vehicle_make,
    vehicleModel: row.vehicle_model,
    vehicleYear: row.vehicle_year,
    status: row.status as OrderStatus,
    amountInr: row.amount_inr,
    deliveryAddress: row.delivery_address,
    addressVerified: row.address_verified === 1,
    city: row.city,
    pincode: row.pincode,
    createdAt: row.created_at,
  };
}

function mapPayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    orderId: row.order_id,
    gateway: row.gateway as PaymentGateway,
    status: row.status as PaymentStatus,
    amountInr: row.amount_inr,
    method: row.method as PaymentMethod,
    transactionRef: row.transaction_ref,
    failureReason: row.failure_reason,
    paidAt: row.paid_at,
    createdAt: row.created_at,
  };
}

function mapDelivery(row: DeliveryRow): Delivery {
  return {
    id: row.id,
    orderId: row.order_id,
    status: row.status as DeliveryStatus,
    carrier: row.carrier,
    trackingNumber: row.tracking_number,
    scheduledAt: row.scheduled_at,
    eta: row.eta,
    delayReason: row.delay_reason,
    createdAt: row.created_at,
  };
}

function mapLog(row: DeliveryLogRow): DeliveryLog {
  return {
    id: row.id,
    deliveryId: row.delivery_id,
    eventType: row.event_type,
    message: row.message,
    location: row.location,
    createdAt: row.created_at,
  };
}

function collectBlockers(order: Order, paymentStatus: PaymentStatus | null, delivery: Delivery | null): string[] {
  const blockers: string[] = [];
  if (!order.deliveryAddress) {
    blockers.push('Delivery address is missing.');
  }
  if (!order.addressVerified) {
    blockers.push('Delivery address is not verified.');
  }
  if (paymentStatus !== 'succeeded') {
    blockers.push(`Payment is ${paymentStatus ?? 'absent'}; delivery cannot complete.`);
  }
  if (delivery?.status === 'unscheduled') {
    blockers.push(delivery.delayReason ?? 'Delivery is unscheduled.');
  }
  if (delivery?.status === 'delayed' && delivery.delayReason) {
    blockers.push(delivery.delayReason);
  }
  return blockers;
}

export class OpsService {
  public getOrderStatus(orderId: string): OrderStatusView {
    const db = getDatabase();
    const orderRow = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as OrderRow | undefined;
    if (!orderRow) {
      return { found: false, order: null, latestPaymentStatus: null, latestDeliveryStatus: null, blockers: [] };
    }

    const order = mapOrder(orderRow);
    const paymentRow = db
      .prepare('SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1')
      .get(orderId) as PaymentRow | undefined;
    const deliveryRow = db.prepare('SELECT * FROM deliveries WHERE order_id = ?').get(orderId) as
      | DeliveryRow
      | undefined;
    const delivery = deliveryRow ? mapDelivery(deliveryRow) : null;
    const paymentStatus = paymentRow ? (paymentRow.status as PaymentStatus) : null;

    return {
      found: true,
      order,
      latestPaymentStatus: paymentStatus,
      latestDeliveryStatus: delivery?.status ?? null,
      blockers: collectBlockers(order, paymentStatus, delivery),
    };
  }

  public getPaymentDetails(orderId: string): PaymentDetailsView {
    const db = getDatabase();
    const orderExists = db.prepare('SELECT 1 FROM orders WHERE id = ?').get(orderId) as { 1: number } | undefined;
    if (!orderExists) {
      return { found: false, orderId, payments: [] };
    }

    const rows = db
      .prepare('SELECT * FROM payments WHERE order_id = ? ORDER BY created_at ASC')
      .all(orderId) as PaymentRow[];

    return { found: true, orderId, payments: rows.map(mapPayment) };
  }

  public getDeliveryLogs(orderId: string): DeliveryLogsView {
    const db = getDatabase();
    const deliveryRow = db.prepare('SELECT * FROM deliveries WHERE order_id = ?').get(orderId) as
      | DeliveryRow
      | undefined;
    if (!deliveryRow) {
      const orderExists = db.prepare('SELECT 1 FROM orders WHERE id = ?').get(orderId) as { 1: number } | undefined;
      return { found: Boolean(orderExists), orderId, delivery: null, logs: [] };
    }

    const logs = db
      .prepare('SELECT * FROM delivery_logs WHERE delivery_id = ? ORDER BY created_at ASC')
      .all(deliveryRow.id) as DeliveryLogRow[];

    return {
      found: true,
      orderId,
      delivery: mapDelivery(deliveryRow),
      logs: logs.map(mapLog),
    };
  }

  public ping(): boolean {
    const row = getDatabase().prepare('SELECT 1 AS ok').get() as { ok: number } | undefined;
    return row?.ok === 1;
  }

  public getOrCreateSession(sessionId: string | undefined, agentId: string): ChatSession {
    const db = getDatabase();
    const now = new Date().toISOString();

    if (sessionId) {
      const existing = db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get(sessionId) as
        | { id: string; agent_id: string; created_at: string; updated_at: string }
        | undefined;
      if (existing) {
        return {
          id: existing.id,
          agentId: existing.agent_id,
          createdAt: existing.created_at,
          updatedAt: existing.updated_at,
        };
      }
    }

    const id = sessionId ?? crypto.randomUUID();
    db.prepare(
      'INSERT INTO chat_sessions (id, agent_id, created_at, updated_at) VALUES (?, ?, ?, ?)',
    ).run(id, agentId, now, now);

    return { id, agentId, createdAt: now, updatedAt: now };
  }

  public appendMessage(message: ChatMessage): void {
    const db = getDatabase();
    db.prepare(
      `INSERT INTO chat_messages (id, session_id, role, content, tool_invocations_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(
      message.id,
      message.sessionId,
      message.role,
      message.content,
      message.toolInvocations ? JSON.stringify(message.toolInvocations) : null,
      message.createdAt,
    );
    db.prepare('UPDATE chat_sessions SET updated_at = ? WHERE id = ?').run(message.createdAt, message.sessionId);
  }

  public listRecentMessages(sessionId: string, limit = 12): ChatMessage[] {
    const rows = getDatabase()
      .prepare(
        `SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at DESC LIMIT ?`,
      )
      .all(sessionId, limit) as Array<{
      id: string;
      session_id: string;
      role: string;
      content: string;
      tool_invocations_json: string | null;
      created_at: string;
    }>;

    return rows
      .reverse()
      .map((row) => ({
        id: row.id,
        sessionId: row.session_id,
        role: row.role as ChatMessage['role'],
        content: row.content,
        toolInvocations: row.tool_invocations_json
          ? (JSON.parse(row.tool_invocations_json) as ChatMessage['toolInvocations'])
          : null,
        createdAt: row.created_at,
      }));
  }
}

export const opsService = new OpsService();
