import { setupVincentDevelopmentEnvironment } from '@lit-protocol/vincent-e2e-test-utils';
import { parseEther } from 'viem';
import {
  validateEnvironment,
  VINCENT_API_URL,
  BUNDLED_VINCENT_ABILITY_CID,
} from './lib/config.js';
import { saveRegistrationData } from './lib/storage.js';

// Validate environment and get config
const env = validateEnvironment();

// Display script header
console.log('=== Vincent App Registration Script ===');
console.log(`Vincent Registry: ${env.VINCENT_REGISTRY_NETWORK} (Chain ID: ${env.VINCENT_REGISTRY_CHAIN.id})`);
console.log(`Vincent Registry RPC: ${env.VINCENT_REGISTRY_RPC_URL}`);
console.log(`Smart Account Chain: ${env.SMART_ACCOUNT_NETWORK} (Chain ID: ${env.SMART_ACCOUNT_CHAIN.id})`);
console.log(`Smart Account RPC: ${env.SMART_ACCOUNT_RPC_URL}`);
console.log('');

// Prepare configuration for setupVincentDevelopmentEnvironment
const setupConfig = {
  vincentRegistryRpcUrl: env.VINCENT_REGISTRY_RPC_URL,
  vincentRegistryChain: env.VINCENT_REGISTRY_CHAIN as any,
  smartAccountChainRpcUrl: env.SMART_ACCOUNT_RPC_URL,
  smartAccountChain: env.SMART_ACCOUNT_CHAIN as any,
  vincentApiUrl: VINCENT_API_URL,
  privateKeys: {
    funder: env.VINCENT_FUNDER_PRIVATE_KEY as `0x${string}`,
    appManager: env.VINCENT_APP_MANAGER_PRIVATE_KEY as `0x${string}`,
    appDelegatee: env.VINCENT_APP_DELEGATEE_PRIVATE_KEY as `0x${string}`,
    // Use app manager as user for simplicity (not installing for a user during registration)
    userEoa: env.VINCENT_APP_MANAGER_PRIVATE_KEY as `0x${string}`,
  },
  appMetadata: {
    name: env.APP_NAME,
    description: env.APP_DESCRIPTION,
    contactEmail: env.APP_CONTACT_EMAIL,
    appUrl: env.APP_URL,
    logo: env.APP_LOGO,
    deploymentStatus: env.DEPLOYMENT_STATUS,
  },
  abilityIpfsCids: [BUNDLED_VINCENT_ABILITY_CID],
  abilityPolicies: [[]],
  funding: {
    funder: {
      minAmountVincentRegistryChain: parseEther('0.0001'),
    },
    appManagerMinAmount: {
      minAmountVincentRegistryChain: parseEther('0.0009'),
    },
    userEoaMinAmount: {
      minAmountVincentRegistryChain: parseEther('0.0003'),
    },
  },
  // Skip smart account setup - users will install via Privy in the frontend
  skipSmartAccountSetup: true,
};

// Run the registration process
async function main() {
  try {
    console.log('=== Setting up Vincent Development Environment ===');
    console.log(`App Manager: ${setupConfig.privateKeys.appManager}`);
    console.log('');

    // Use the helper method to set up everything
    const devEnv = await setupVincentDevelopmentEnvironment(setupConfig);

    console.log('');
    console.log('=== Registration Complete ===');
    console.log(`App ID: ${devEnv.appId}`);
    console.log(`App Version: ${devEnv.appVersion}`);
    console.log(`Account Index Hash: ${devEnv.accountIndexHash || 'N/A'}`);
    console.log(`App Manager: ${devEnv.accounts.appManager.address}`);
    console.log(`App Delegatee: ${devEnv.accounts.appDelegatee.address}`);
    console.log('');

    // Save registration data to file
    saveRegistrationData(
      BigInt(devEnv.appId),
      devEnv.accounts.appManager.address,
      devEnv.accountIndexHash || '',
      BigInt(devEnv.appVersion),
      [devEnv.accounts.appDelegatee.address],
      setupConfig.abilityIpfsCids,
      setupConfig.abilityPolicies,
      env.VINCENT_REGISTRY_NETWORK,
      env.VINCENT_REGISTRY_CHAIN.id,
      '', // Transaction hash not provided by helper
      BigInt(0) // Block number not provided by helper
    );

    console.log('✅ Script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Execute main function
main();
