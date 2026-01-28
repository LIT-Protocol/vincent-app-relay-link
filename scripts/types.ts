import type { Hash, TransactionReceipt } from 'viem';

/**
 * Registration data that will be saved to vincent-app-config.json
 */
export interface RegistrationData {
  /** The unique app ID assigned by Vincent registry */
  appId: string;
  /** Address of the app manager (owner) */
  appManagerAddress: string;
  /** Hash used for deterministic smart account address derivation */
  accountIndexHash: string;
  /** Version number of the registered app */
  appVersion: string;
  /** Array of delegatee addresses that can sign on behalf of users */
  delegatees: string[];
  /** IPFS CIDs of registered abilities (e.g., relay.link) */
  abilityIpfsCids: string[];
  /** Policy IPFS CIDs for each ability (empty if no policies) */
  abilityPolicies: string[][];
  /** Network name (e.g., 'base-sepolia' or 'base') */
  network: string;
  /** Blockchain chain ID */
  chainId: number;
  /** Transaction hash of the registration transaction */
  transactionHash: string;
  /** Block number where the registration was confirmed */
  blockNumber: string;
  /** ISO timestamp of when registration was completed */
  timestamp: string;
}

/**
 * Return type for registerApp function
 */
export interface RegisterAppResult {
  /** Transaction hash */
  hash: Hash;
  /** Transaction receipt */
  receipt: TransactionReceipt;
  /** The assigned app ID */
  appId: bigint;
  /** The account index hash for address derivation */
  accountIndexHash: string;
  /** The app version number */
  appVersion: bigint;
}

/**
 * Environment variables required for script execution
 */
export interface ScriptEnvironment {
  /** Network to deploy on (base-sepolia or base) */
  NETWORK: string;
  /** RPC endpoint URL */
  RPC_URL: string;
  /** Private key for app manager account */
  VINCENT_APP_MANAGER_PRIVATE_KEY: string;
  /** Private key for delegatee account */
  VINCENT_APP_DELEGATEE_PRIVATE_KEY: string;
  /** App name */
  APP_NAME: string;
  /** App description */
  APP_DESCRIPTION: string;
  /** Contact email */
  APP_CONTACT_EMAIL: string;
  /** App URL */
  APP_URL: string;
  /** App logo (optional) */
  APP_LOGO?: string;
  /** Deployment status */
  DEPLOYMENT_STATUS: 'dev' | 'test' | 'prod';
}
