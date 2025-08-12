-- AgentPay Database Schema
-- Run this script to initialize the database

CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    invoice_id TEXT UNIQUE NOT NULL,
    service_type TEXT NOT NULL,
    payee TEXT NOT NULL,
    amount TEXT NOT NULL,
    token TEXT NOT NULL,
    chain TEXT NOT NULL,
    description TEXT NOT NULL,
    options TEXT NOT NULL, -- JSON string
    status TEXT NOT NULL DEFAULT 'CREATED',
    buyer_contact TEXT,
    deadline INTEGER NOT NULL,
    revisions_allowed INTEGER NOT NULL DEFAULT 2,
    expiry_timestamp INTEGER NOT NULL,
    deliverable_url TEXT,
    tx_hash TEXT,
    payer TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    paid_at INTEGER
);

CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL,
    tx_hash TEXT UNIQUE NOT NULL,
    payer TEXT NOT NULL,
    amount TEXT NOT NULL,
    token TEXT NOT NULL,
    chain TEXT NOT NULL,
    confirmations INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (invoice_id) REFERENCES invoices (invoice_id)
);

CREATE TABLE IF NOT EXISTS deliveries (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL,
    delivery_url TEXT NOT NULL,
    delivery_type TEXT NOT NULL,
    delivered_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (invoice_id) REFERENCES invoices (invoice_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_chain ON invoices(chain);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_tx_hash ON payments(tx_hash);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);

-- Insert sample service configurations
INSERT OR IGNORE INTO invoices (
    id, invoice_id, service_type, payee, amount, token, chain, 
    description, options, deadline, expiry_timestamp
) VALUES (
    'sample-1', 
    '0x1234567890abcdef1234567890abcdef12345678901234567890abcdef123456',
    'LOGO',
    '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4',
    '45000000', -- 45 USDC (6 decimals)
    '0xA0b86a33E6441b8C4505B8C4505B8C4505B8C4505',
    'ethereum',
    'Professional logo design for tech startup',
    '{"concepts": 2, "revisions": 2, "vectorFiles": true}',
    strftime('%s', 'now') + 259200, -- 3 days from now
    strftime('%s', 'now') + 604800  -- 7 days from now
);
