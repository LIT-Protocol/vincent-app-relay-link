import vincentAppConfig from '../vincent-app-config.json';

export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';
export const BASE_CHAIN_ID = 8453;
export const VINCENT_API_URL = process.env.NEXT_PUBLIC_VINCENT_API_URL || 'https://api.heyvincent.ai';

// USDC on Base Mainnet
export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

// Vincent App Configuration
export const APP_ID = vincentAppConfig.appId;
export const ACCOUNT_INDEX_HASH = vincentAppConfig.accountIndexHash;
