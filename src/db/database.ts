import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let dbInstance: Database.Database | null = null;

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_year INTEGER NOT NULL,
  status TEXT NOT NULL,
  amount_inr INTEGER NOT NULL,
  delivery_address TEXT,
  address_verified INTEGER NOT NULL DEFAULT 0,
  city TEXT,
  pincode TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  gateway TEXT NOT NULL,
  status TEXT NOT NULL,
  amount_inr INTEGER NOT NULL,
  method TEXT NOT NULL,
  transaction_ref TEXT,
  failure_reason TEXT,
  paid_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS deliveries (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  carrier TEXT,
  tracking_number TEXT,
  scheduled_at TEXT,
  eta TEXT,
  delay_reason TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS delivery_logs (
  id TEXT PRIMARY KEY,
  delivery_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  message TEXT NOT NULL,
  location TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (delivery_id) REFERENCES deliveries(id)
);

CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  tool_invocations_json TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_delivery_id ON delivery_logs(delivery_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
`;

/**
 * Opens (or reuses) the SQLite connection with WAL, foreign keys, and a busy timeout.
 */
export function getDatabase(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const resolvedPath = path.resolve(env.databasePath);
  const directory = path.dirname(resolvedPath);

  try {
    fs.mkdirSync(directory, { recursive: true });
  } catch (error) {
    throw new Error(`Unable to create SQLite directory ${directory}: ${String(error)}`);
  }

  try {
    const db = new Database(resolvedPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('busy_timeout = 5000');
    db.exec(SCHEMA_SQL);
    dbInstance = db;
    logger.info({ databasePath: resolvedPath }, 'SQLite connection ready');
    return db;
  } catch (error) {
    logger.error({ err: error, databasePath: resolvedPath }, 'Failed to open SQLite');
    throw error;
  }
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
