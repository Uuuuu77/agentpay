import os
import json
import requests
from urllib.parse import urlparse

def validate_setup():
    """Validate AgentPay environment setup"""
    print("🔍 Validating AgentPay Setup...\n")
    
    # Load environment variables
    env_file = '.env.local'
    env_vars = {}
    
    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    env_vars[key] = value
    else:
        print("❌ .env.local file not found!")
        return False
    
    # Validation results
    results = {
        'required': [],
        'optional': [],
        'errors': []
    }
    
    # Required validations
    required_checks = [
        ('PAYEE_ADDRESS', validate_ethereum_address),
        ('POLYGON_RPC_URL', validate_rpc_url),
        ('OPENAI_API_KEY', validate_openai_key),
        ('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID', validate_walletconnect_id),
        ('CONFIRMATIONS_REQUIRED', validate_confirmations)
    ]
    
    for key, validator in required_checks:
        value = env_vars.get(key, '').replace('YOUR_API_KEY', '').replace('0xYourWalletAddress', '')
        if value and not value.startswith('sk-proj-...') and not value.startswith('AIza...'):
            status, message = validator(value)
            results['required'].append({
                'key': key,
                'status': status,
                'message': message
            })
        else:
            results['required'].append({
                'key': key,
                'status': False,
                'message': 'Not configured (using example value)'
            })
    
    # Optional validations
    optional_checks = [
        ('ETHEREUM_RPC_URL', validate_rpc_url),
        ('BSC_RPC_URL', validate_rpc_url),
        ('GOOGLE_AI_API_KEY', validate_google_ai_key),
        ('REPLICATE_API_TOKEN', validate_replicate_token)
    ]
    
    for key, validator in optional_checks:
        value = env_vars.get(key, '')
        if value and not value.startswith('https://eth-mainnet.g.alchemy.com'):
            status, message = validator(value)
            results['optional'].append({
                'key': key,
                'status': status,
                'message': message
            })
    
    # Print results
    print("📋 REQUIRED CONFIGURATION:")
    all_required_valid = True
    for result in results['required']:
        status_icon = "✅" if result['status'] else "❌"
        print(f"  {status_icon} {result['key']}: {result['message']}")
        if not result['status']:
            all_required_valid = False
    
    print("\n📋 OPTIONAL CONFIGURATION:")
    for result in results['optional']:
        status_icon = "✅" if result['status'] else "⚠️"
        print(f"  {status_icon} {result['key']}: {result['message']}")
    
    print(f"\n🎯 SETUP STATUS: {'✅ READY' if all_required_valid else '❌ INCOMPLETE'}")
    
    if all_required_valid:
        print("\n🚀 Next steps:")
        print("1. Run: npm run dev")
        print("2. Visit: http://localhost:3000")
        print("3. Test payment flow with small amount")
    else:
        print("\n🔧 Fix required configuration above, then run this script again")
    
    return all_required_valid

def validate_ethereum_address(address):
    """Validate Ethereum address format"""
    if not address.startswith('0x') or len(address) != 42:
        return False, "Invalid Ethereum address format"
    try:
        int(address[2:], 16)
        return True, "Valid Ethereum address"
    except ValueError:
        return False, "Invalid hexadecimal characters"

def validate_rpc_url(url):
    """Validate RPC URL connectivity"""
    try:
        parsed = urlparse(url)
        if not parsed.scheme or not parsed.netloc:
            return False, "Invalid URL format"
        
        # Test connection with a simple request
        payload = {
            "jsonrpc": "2.0",
            "method": "eth_blockNumber",
            "params": [],
            "id": 1
        }
        response = requests.post(url, json=payload, timeout=10)
        if response.status_code == 200:
            return True, "RPC connection successful"
        else:
            return False, f"RPC connection failed: {response.status_code}"
    except Exception as e:
        return False, f"RPC connection error: {str(e)}"

def validate_openai_key(key):
    """Validate OpenAI API key format"""
    if key.startswith('sk-') and len(key) > 20:
        return True, "Valid OpenAI API key format"
    return False, "Invalid OpenAI API key format"

def validate_walletconnect_id(project_id):
    """Validate WalletConnect project ID format"""
    if len(project_id) >= 32:
        return True, "Valid WalletConnect project ID"
    return False, "Invalid WalletConnect project ID"

def validate_confirmations(confirmations):
    """Validate confirmations number"""
    try:
        num = int(confirmations)
        if 1 <= num <= 20:
            return True, f"Valid confirmation count: {num}"
        return False, "Confirmations should be between 1-20"
    except ValueError:
        return False, "Confirmations must be a number"

def validate_google_ai_key(key):
    """Validate Google AI API key format"""
    if key.startswith('AIza') and len(key) > 30:
        return True, "Valid Google AI API key format"
    return False, "Invalid Google AI API key format"

def validate_replicate_token(token):
    """Validate Replicate API token format"""
    if token.startswith('r8_') and len(token) > 10:
        return True, "Valid Replicate API token format"
    return False, "Invalid Replicate API token format"

if __name__ == "__main__":
    validate_setup()
