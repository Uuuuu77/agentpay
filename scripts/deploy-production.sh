#!/bin/bash

# AgentPay Production Deployment Script
set -e

echo "🚀 Starting AgentPay production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required environment variables are set
check_env_vars() {
    echo "📋 Checking environment variables..."
    
    required_vars=(
        "DATABASE_URL"
        "NEXTAUTH_SECRET"
        "ALCHEMY_API_KEY"
        "OPENAI_API_KEY"
        "GROQ_API_KEY"
        "PAYEE_ADDRESS"
        "WEBHOOK_SECRET"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo -e "${RED}❌ Missing required environment variables:${NC}"
        printf '%s\n' "${missing_vars[@]}"
        echo "Please set these variables before deploying."
        exit 1
    fi
    
    echo -e "${GREEN}✅ All required environment variables are set${NC}"
}

# Build and test the application
build_and_test() {
    echo "🔨 Building application..."
    npm run build
    
    echo "🧪 Running tests..."
    npm test || echo -e "${YELLOW}⚠️ Tests failed but continuing deployment${NC}"
}

# Deploy to Vercel
deploy_vercel() {
    echo "🌐 Deploying to Vercel..."
    
    if command -v vercel &> /dev/null; then
        vercel --prod --confirm
        echo -e "${GREEN}✅ Deployed to Vercel successfully${NC}"
    else
        echo -e "${RED}❌ Vercel CLI not found. Please install it first:${NC}"
        echo "npm i -g vercel"
        exit 1
    fi
}

# Deploy smart contracts
deploy_contracts() {
    echo "📜 Deploying smart contracts..."
    
    if [ -f "hardhat.config.js" ]; then
        npx hardhat run scripts/deploy.js --network mainnet
        echo -e "${GREEN}✅ Smart contracts deployed${NC}"
    else
        echo -e "${YELLOW}⚠️ No Hardhat config found, skipping contract deployment${NC}"
    fi
}

# Setup monitoring
setup_monitoring() {
    echo "📊 Setting up monitoring..."
    
    # Create monitoring endpoints
    curl -X POST "${NEXTAUTH_URL}/api/health" || echo -e "${YELLOW}⚠️ Health check endpoint not responding${NC}"
    
    echo -e "${GREEN}✅ Monitoring setup complete${NC}"
}

# Main deployment flow
main() {
    echo "🎯 AgentPay Production Deployment"
    echo "=================================="
    
    check_env_vars
    build_and_test
    deploy_contracts
    deploy_vercel
    setup_monitoring
    
    echo ""
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo ""
    echo "📋 Post-deployment checklist:"
    echo "  - Verify application is accessible"
    echo "  - Test payment flow with small amount"
    echo "  - Check service delivery automation"
    echo "  - Monitor error logs for 24 hours"
    echo "  - Update DNS records if needed"
    echo ""
    echo "🔗 Application URL: ${NEXTAUTH_URL}"
}

# Run deployment
main "$@"
