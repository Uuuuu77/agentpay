# AgentPay Production Deployment Guide

## Overview

This guide covers the complete production deployment process for AgentPay, including environment setup, smart contract deployment, and monitoring configuration.

## Prerequisites

- Node.js 18+ installed
- Vercel CLI installed (`npm i -g vercel`)
- Database (Neon/PostgreSQL) set up
- Alchemy API key for blockchain access
- AI service API keys (OpenAI, Groq, Google AI Studio)

## Quick Start

1. **Clone and Setup**
   \`\`\`bash
   git clone <repository-url>
   cd agentpay
   npm install
   \`\`\`

2. **Environment Configuration**
   \`\`\`bash
   cp production.env.template .env.production
   # Edit .env.production with your actual values
   \`\`\`

3. **Deploy to Vercel**
   \`\`\`bash
   chmod +x scripts/deploy-production.sh
   ./scripts/deploy-production.sh
   \`\`\`

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | Generate with `openssl rand -base64 32` |
| `ALCHEMY_API_KEY` | Alchemy API key for blockchain | `your-alchemy-key` |
| `PAYEE_ADDRESS` | Wallet address to receive payments | `0x1234...` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `GROQ_API_KEY` | Groq API key | `gsk_...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CONFIRMATIONS_REQUIRED` | Blockchain confirmations needed | `3` |
| `SERVICE_TIMEOUT` | Service generation timeout (ms) | `300000` |
| `DEBUG` | Enable debug logging | `false` |

## Deployment Methods

### Method 1: Vercel (Recommended)

1. **Connect Repository**
   \`\`\`bash
   vercel login
   vercel link
   \`\`\`

2. **Set Environment Variables**
   \`\`\`bash
   vercel env add DATABASE_URL production
   vercel env add NEXTAUTH_SECRET production
   # ... add all required variables
   \`\`\`

3. **Deploy**
   \`\`\`bash
   vercel --prod
   \`\`\`

### Method 2: Docker

1. **Build Image**
   \`\`\`bash
   docker build -t agentpay .
   \`\`\`

2. **Run Container**
   \`\`\`bash
   docker-compose up -d
   \`\`\`

### Method 3: Manual Server

1. **Build Application**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Start Production Server**
   \`\`\`bash
   npm start
   \`\`\`

## Smart Contract Deployment

1. **Configure Networks**
   - Edit `hardhat.config.js` with your RPC URLs
   - Set deployer private key in environment

2. **Deploy Contracts**
   \`\`\`bash
   npx hardhat run scripts/deploy.js --network mainnet
   npx hardhat run scripts/deploy.js --network polygon
   \`\`\`

3. **Verify Contracts**
   \`\`\`bash
   npx hardhat verify --network mainnet <contract-address>
   \`\`\`

## Post-Deployment Checklist

### Immediate Verification
- [ ] Application loads successfully
- [ ] Health check endpoint responds (`/api/health`)
- [ ] Database connection works
- [ ] Wallet connection functions
- [ ] Service catalog displays

### Payment Flow Testing
- [ ] Create test invoice
- [ ] Send small test payment
- [ ] Verify payment detection
- [ ] Check service delivery
- [ ] Confirm file generation

### Security Verification
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] API rate limiting active
- [ ] Input validation working
- [ ] File upload security enabled

### Performance Testing
- [ ] Page load times < 3 seconds
- [ ] API response times < 1 second
- [ ] Service generation completes
- [ ] Mobile experience optimized
- [ ] PWA features working

## Monitoring & Maintenance

### Health Monitoring
- Set up uptime monitoring (Pingdom, UptimeRobot)
- Configure error tracking (Sentry)
- Monitor API response times
- Track payment success rates

### Log Monitoring
\`\`\`bash
# View application logs
vercel logs --follow

# Check specific function logs
vercel logs --function=api/watcher/start
\`\`\`

### Database Maintenance
- Regular backups
- Connection pool monitoring
- Query performance optimization
- Index maintenance

## Troubleshooting

### Common Issues

1. **Payment Detection Fails**
   - Check Alchemy API key
   - Verify network configuration
   - Confirm contract addresses

2. **Service Generation Errors**
   - Validate AI API keys
   - Check service timeouts
   - Review error logs

3. **Database Connection Issues**
   - Verify connection string
   - Check connection limits
   - Test database accessibility

### Support Resources
- GitHub Issues: [Repository Issues]
- Documentation: [Docs Link]
- Community: [Discord/Telegram]

## Security Best Practices

1. **Environment Security**
   - Never commit secrets to git
   - Use environment variables for all sensitive data
   - Rotate API keys regularly

2. **Application Security**
   - Keep dependencies updated
   - Enable CORS properly
   - Validate all user inputs
   - Use HTTPS everywhere

3. **Blockchain Security**
   - Use hardware wallets for production
   - Verify contract addresses
   - Monitor for unusual transactions
   - Set appropriate confirmation requirements

## Backup & Recovery

### Database Backups
\`\`\`bash
# Daily automated backups
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
\`\`\`

### File Storage Backups
- Configure automated S3/cloud storage backups
- Test restore procedures regularly
- Document recovery processes

### Disaster Recovery Plan
1. Identify critical components
2. Document recovery procedures
3. Test recovery processes
4. Maintain emergency contacts
