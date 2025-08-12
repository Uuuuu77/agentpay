-- AgentPay Database Schema
-- Creates tables for invoice and payment tracking

-- Invoices table for tracking service orders
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_id VARCHAR(255) UNIQUE NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    service_config JSONB NOT NULL,
    amount DECIMAL(18, 6) NOT NULL,
    token VARCHAR(10) NOT NULL, -- USDC, USDT
    chain VARCHAR(50) NOT NULL, -- ethereum, polygon, bsc
    client_address VARCHAR(42) NOT NULL,
    payee_address VARCHAR(42) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, paid, delivered, cancelled
    payment_tx_hash VARCHAR(66),
    payment_confirmed_at TIMESTAMP,
    delivered_at TIMESTAMP,
    delivery_files JSONB, -- Array of file URLs/paths
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table for tracking blockchain transactions
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    invoice_id VARCHAR(255) REFERENCES invoices(invoice_id),
    tx_hash VARCHAR(66) UNIQUE NOT NULL,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    amount DECIMAL(18, 6) NOT NULL,
    token VARCHAR(10) NOT NULL,
    chain VARCHAR(50) NOT NULL,
    block_number BIGINT,
    confirmations INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, failed
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP
);

-- Service delivery logs
CREATE TABLE IF NOT EXISTS delivery_logs (
    id SERIAL PRIMARY KEY,
    invoice_id VARCHAR(255) REFERENCES invoices(invoice_id),
    service_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL, -- processing, completed, failed
    progress_data JSONB,
    error_message TEXT,
    files_generated JSONB,
    processing_time INTEGER, -- seconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_address);
CREATE INDEX IF NOT EXISTS idx_payments_tx_hash ON payments(tx_hash);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_invoice ON delivery_logs(invoice_id);

-- Insert sample data for testing
INSERT INTO invoices (
    invoice_id, service_type, service_config, amount, token, chain, 
    client_address, payee_address, status
) VALUES (
    'INV-SAMPLE-001',
    'logo-design',
    '{"style": "modern", "colors": ["#FF6B35", "#F7931E"], "text": "AgentPay"}',
    50.00,
    'USDC',
    'polygon',
    '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
    '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
    'pending'
) ON CONFLICT (invoice_id) DO NOTHING;

COMMIT;

-- Display setup confirmation
SELECT 'AgentPay database tables created successfully!' as status;
SELECT COUNT(*) as invoice_count FROM invoices;
SELECT COUNT(*) as payment_count FROM payments;
