import sqlite3 from "sqlite3"
import { promisify } from "util"
import { v4 as uuidv4 } from "uuid"
import type { Invoice, Payment, InvoiceStatus } from "../types"

export class DatabaseManager {
  private db: sqlite3.Database | null = null
  private dbPath: string

  constructor(dbPath?: string) {
    this.dbPath = dbPath || process.env.DATABASE_URL || "./database.sqlite"
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err)
          return
        }

        console.log(`Connected to SQLite database: ${this.dbPath}`)
        this.createTables()
          .then(() => resolve())
          .catch(reject)
      })
    })
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    const run = promisify(this.db.run.bind(this.db))

    await run(`
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        invoice_id TEXT UNIQUE NOT NULL,
        service_type TEXT NOT NULL,
        payee TEXT NOT NULL,
        amount TEXT NOT NULL,
        token TEXT NOT NULL,
        chain TEXT NOT NULL,
        description TEXT NOT NULL,
        options TEXT NOT NULL,
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
      )
    `)

    await run(`
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
      )
    `)

    await run(`
      CREATE TABLE IF NOT EXISTS deliveries (
        id TEXT PRIMARY KEY,
        invoice_id TEXT NOT NULL,
        delivery_url TEXT NOT NULL,
        delivery_type TEXT NOT NULL,
        delivered_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (invoice_id) REFERENCES invoices (invoice_id)
      )
    `)

    // Create indexes
    await run(`CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)`)
    await run(`CREATE INDEX IF NOT EXISTS idx_invoices_chain ON invoices(chain)`)
    await run(`CREATE INDEX IF NOT EXISTS idx_payments_tx_hash ON payments(tx_hash)`)
    await run(`CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id)`)
  }

  async createInvoice(invoice: Omit<Invoice, "id" | "createdAt">): Promise<Invoice> {
    if (!this.db) throw new Error("Database not initialized")

    const run = promisify(this.db.run.bind(this.db))
    const id = uuidv4()
    const createdAt = Math.floor(Date.now() / 1000)

    await run(
      `INSERT INTO invoices (
        id, invoice_id, service_type, payee, amount, token, chain,
        description, options, status, buyer_contact, deadline,
        revisions_allowed, expiry_timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        invoice.invoiceId,
        invoice.serviceType,
        invoice.payee,
        invoice.amount,
        invoice.token,
        invoice.chain,
        invoice.description,
        JSON.stringify(invoice.options),
        invoice.status,
        invoice.buyerContact,
        invoice.deadline,
        invoice.revisionsAllowed,
        invoice.expiryTimestamp,
      ],
    )

    return {
      id,
      createdAt,
      ...invoice,
    }
  }

  async getInvoice(invoiceId: string): Promise<Invoice | null> {
    if (!this.db) throw new Error("Database not initialized")

    const get = promisify(this.db.get.bind(this.db))
    const row = await get(`SELECT * FROM invoices WHERE invoice_id = ?`, [invoiceId])

    if (!row) return null

    return {
      id: row.id,
      invoiceId: row.invoice_id,
      serviceType: row.service_type,
      payee: row.payee,
      amount: row.amount,
      token: row.token,
      chain: row.chain,
      description: row.description,
      options: JSON.parse(row.options),
      status: row.status,
      buyerContact: row.buyer_contact,
      deadline: row.deadline,
      revisionsAllowed: row.revisions_allowed,
      expiryTimestamp: row.expiry_timestamp,
      deliverableURL: row.deliverable_url,
      txHash: row.tx_hash,
      payer: row.payer,
      createdAt: row.created_at,
      paidAt: row.paid_at,
    }
  }

  async updateInvoiceStatus(invoiceId: string, status: InvoiceStatus, updates?: Partial<Invoice>): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    const run = promisify(this.db.run.bind(this.db))

    let query = `UPDATE invoices SET status = ?`
    const params: any[] = [status]

    if (updates) {
      if (updates.txHash) {
        query += `, tx_hash = ?`
        params.push(updates.txHash)
      }
      if (updates.payer) {
        query += `, payer = ?`
        params.push(updates.payer)
      }
      if (updates.paidAt) {
        query += `, paid_at = ?`
        params.push(updates.paidAt)
      }
      if (updates.deliverableURL) {
        query += `, deliverable_url = ?`
        params.push(updates.deliverableURL)
      }
    }

    query += ` WHERE invoice_id = ?`
    params.push(invoiceId)

    await run(query, params)
  }

  async createPayment(payment: Omit<Payment, "id" | "createdAt">): Promise<Payment> {
    if (!this.db) throw new Error("Database not initialized")

    const run = promisify(this.db.run.bind(this.db))
    const id = uuidv4()
    const createdAt = Math.floor(Date.now() / 1000)

    await run(
      `INSERT INTO payments (
        id, invoice_id, tx_hash, payer, amount, token, chain, confirmations
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        payment.invoiceId,
        payment.txHash,
        payment.payer,
        payment.amount,
        payment.token,
        payment.chain,
        payment.confirmations,
      ],
    )

    return {
      id,
      createdAt,
      ...payment,
    }
  }

  async updatePaymentConfirmations(txHash: string, confirmations: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    const run = promisify(this.db.run.bind(this.db))
    await run(`UPDATE payments SET confirmations = ? WHERE tx_hash = ?`, [confirmations, txHash])
  }

  async getPaymentByTxHash(txHash: string): Promise<Payment | null> {
    if (!this.db) throw new Error("Database not initialized")

    const get = promisify(this.db.get.bind(this.db))
    const row = await get(`SELECT * FROM payments WHERE tx_hash = ?`, [txHash])

    if (!row) return null

    return {
      id: row.id,
      invoiceId: row.invoice_id,
      txHash: row.tx_hash,
      payer: row.payer,
      amount: row.amount,
      token: row.token,
      chain: row.chain,
      confirmations: row.confirmations,
      createdAt: row.created_at,
    }
  }

  async getInvoicesByStatus(status: InvoiceStatus): Promise<Invoice[]> {
    if (!this.db) throw new Error("Database not initialized")

    const all = promisify(this.db.all.bind(this.db))
    const rows = await all(`SELECT * FROM invoices WHERE status = ?`, [status])

    return rows.map((row: any) => ({
      id: row.id,
      invoiceId: row.invoice_id,
      serviceType: row.service_type,
      payee: row.payee,
      amount: row.amount,
      token: row.token,
      chain: row.chain,
      description: row.description,
      options: JSON.parse(row.options),
      status: row.status,
      buyerContact: row.buyer_contact,
      deadline: row.deadline,
      revisionsAllowed: row.revisions_allowed,
      expiryTimestamp: row.expiry_timestamp,
      deliverableURL: row.deliverable_url,
      txHash: row.tx_hash,
      payer: row.payer,
      createdAt: row.created_at,
      paidAt: row.paid_at,
    }))
  }

  async close(): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      this.db!.close((err) => {
        if (err) {
          reject(err)
          return
        }
        console.log("Database connection closed")
        resolve()
      })
    })
  }
}
