export interface Invoice {
  id: string
  invoiceId: string
  serviceType: ServiceType
  payee: string
  amount: string
  token: string
  chain: string
  description: string
  options: ServiceOptions
  status: InvoiceStatus
  buyerContact?: string
  deadline: number
  revisionsAllowed: number
  expiryTimestamp: number
  deliverableURL?: string
  txHash?: string
  payer?: string
  createdAt: number
  paidAt?: number
}

export interface Payment {
  id: string
  invoiceId: string
  txHash: string
  payer: string
  amount: string
  token: string
  chain: string
  confirmations: number
  createdAt: number
}

export enum ServiceType {
  LOGO = "LOGO",
  GRAPHIC = "GRAPHIC",
  SCRIPT = "SCRIPT",
  PROMPT = "PROMPT",
  RESUME = "RESUME",
  CONSULT = "CONSULT",
  BUGFIX = "BUGFIX",
  WEBSITE = "WEBSITE",
  EMAIL = "EMAIL",
  LINKEDIN = "LINKEDIN",
  DATA = "DATA",
  SAAS = "SAAS",
}

export enum InvoiceStatus {
  CREATED = "CREATED",
  PAID = "PAID",
  IN_PROGRESS = "IN_PROGRESS",
  DELIVERED = "DELIVERED",
  DISPUTE = "DISPUTE",
  CANCELLED = "CANCELLED",
}

export interface ServiceOptions {
  concepts?: number
  revisions?: number
  vectorFiles?: boolean
  runtime?: "Python" | "Node"
  integration?: string
  targetModel?: string
  tone?: string
  sections?: number
  animations?: boolean
  mobileOptimization?: boolean
  industry?: string
  emailCount?: number
  templates?: boolean
  automation?: string
  personalization?: boolean
  contentStrategy?: boolean
  postTemplates?: number
  networking?: boolean
  dataSize?: string
  visualizations?: number
  insights?: boolean
  dashboard?: boolean
  complexity?: string
  codeReview?: boolean
  testing?: boolean
  documentation?: boolean
  technology?: string
  pitchDeck?: boolean
  businessPlan?: boolean
  mvpSpecs?: boolean
  marketingStrategy?: boolean
  financialModel?: boolean
  [key: string]: any
}

export interface ChainConfig {
  id: number
  name: string
  rpcUrl: string
  blockExplorer: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  tokens: {
    USDC: string
    USDT: string
  }
}

export interface ServiceDefinition {
  type: ServiceType
  name: string
  description: string
  basePrice: number
  options: {
    [key: string]: {
      type: "number" | "boolean" | "select"
      label: string
      default?: any
      options?: string[]
      priceModifier?: number
    }
  }
  deliverables: string[]
  slaHours: number
  badge?: string
  maxPerDay?: number
}
