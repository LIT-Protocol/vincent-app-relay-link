import { config } from 'dotenv';
import { base, baseSepolia } from 'viem/chains';
import type { Chain } from 'viem/chains';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local at project root
config({ path: path.join(__dirname, '..', '..', '.env.local') });

// Chain mapping
export const CHAINS: Record<string, Chain> = {
  'base': base,
  'base-mainnet': base,
  'base-sepolia': baseSepolia,
};

// Vincent API URL
export const VINCENT_API_URL = process.env.NEXT_PUBLIC_VINCENT_API_URL || 'https://api.heyvincent.ai';

// Chronicle Yellowstone RPC URL
export const CHRONICLE_YELLOWSTONE_RPC_URL = 'https://yellowstone-rpc.litprotocol.com';

// Bundled Vincent ability IPFS CID for relay.link
// From @lit-protocol/vincent-ability-relay-link package
// TODO: Update this to the correct CID after building the ability
export const BUNDLED_VINCENT_ABILITY_CID = 'QmUSDv7XougqNrpzjdryJEGibbnyRKWJjGTmptcYMr8oKk';

/**
 * Validate and export environment variables
 */
export function validateEnvironment() {
  // Vincent Registry Chain (where the registry contract lives)
  const VINCENT_REGISTRY_NETWORK = process.env.VINCENT_REGISTRY_NETWORK || 'base-sepolia';
  const VINCENT_REGISTRY_RPC_URL = process.env.VINCENT_REGISTRY_RPC_URL;

  // Smart Account Chain (where smart accounts are deployed and operate)
  const SMART_ACCOUNT_NETWORK = process.env.SMART_ACCOUNT_NETWORK || 'base';
  const SMART_ACCOUNT_RPC_URL = process.env.SMART_ACCOUNT_RPC_URL;

  const VINCENT_FUNDER_PRIVATE_KEY = process.env.VINCENT_FUNDER_PRIVATE_KEY;
  const VINCENT_APP_MANAGER_PRIVATE_KEY = process.env.VINCENT_APP_MANAGER_PRIVATE_KEY;
  const VINCENT_APP_DELEGATEE_PRIVATE_KEY = process.env.VINCENT_APP_DELEGATEE_PRIVATE_KEY;

  if (!CHAINS[VINCENT_REGISTRY_NETWORK]) {
    console.error(`Error: Invalid VINCENT_REGISTRY_NETWORK "${VINCENT_REGISTRY_NETWORK}"`);
    console.error('Available networks: base, base-mainnet, base-sepolia');
    process.exit(1);
  }

  if (!CHAINS[SMART_ACCOUNT_NETWORK]) {
    console.error(`Error: Invalid SMART_ACCOUNT_NETWORK "${SMART_ACCOUNT_NETWORK}"`);
    console.error('Available networks: base, base-mainnet, base-sepolia');
    process.exit(1);
  }

  if (!VINCENT_REGISTRY_RPC_URL) {
    console.error('Error: VINCENT_REGISTRY_RPC_URL environment variable is required');
    console.error('This is the RPC URL for the chain where the Vincent Registry contract is deployed');
    process.exit(1);
  }

  if (!SMART_ACCOUNT_RPC_URL) {
    console.error('Error: SMART_ACCOUNT_RPC_URL environment variable is required');
    console.error('This is the RPC URL for the chain where smart accounts will be deployed');
    process.exit(1);
  }

  if (!VINCENT_FUNDER_PRIVATE_KEY) {
    console.error('Error: VINCENT_FUNDER_PRIVATE_KEY environment variable is required');
    console.error('This should be the private key of the account that will fund other accounts');
    process.exit(1);
  }

  if (!VINCENT_APP_MANAGER_PRIVATE_KEY) {
    console.error('Error: VINCENT_APP_MANAGER_PRIVATE_KEY environment variable is required');
    console.error('This should be the private key of the account that will be the app manager');
    process.exit(1);
  }

  if (!VINCENT_APP_DELEGATEE_PRIVATE_KEY) {
    console.error('Error: VINCENT_APP_DELEGATEE_PRIVATE_KEY environment variable is required');
    process.exit(1);
  }

  return {
    VINCENT_REGISTRY_NETWORK,
    VINCENT_REGISTRY_RPC_URL,
    VINCENT_REGISTRY_CHAIN: CHAINS[VINCENT_REGISTRY_NETWORK],
    SMART_ACCOUNT_NETWORK,
    SMART_ACCOUNT_RPC_URL,
    SMART_ACCOUNT_CHAIN: CHAINS[SMART_ACCOUNT_NETWORK],
    VINCENT_FUNDER_PRIVATE_KEY,
    VINCENT_APP_MANAGER_PRIVATE_KEY,
    VINCENT_APP_DELEGATEE_PRIVATE_KEY,
    APP_NAME: process.env.VINCENT_APP_NAME || 'Vincent Relay Link App',
    APP_DESCRIPTION: process.env.VINCENT_APP_DESCRIPTION || 'A Vincent app that enables cross-chain swaps and bridges via relay.link',
    APP_CONTACT_EMAIL: process.env.VINCENT_APP_CONTACT_EMAIL || 'contact@example.com',
    APP_URL: process.env.VINCENT_APP_URL || 'https://example.com',
    APP_LOGO: process.env.VINCENT_APP_LOGO,
    DEPLOYMENT_STATUS: (process.env.VINCENT_DEPLOYMENT_STATUS || 'dev') as 'dev' | 'test' | 'prod',
  };
}
