import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { RegistrationData } from '../types.js';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Save registration data to packages/frontend/vincent-app-config.json
 */
export function saveRegistrationData(
  appId: bigint,
  appManagerAddress: string,
  accountIndexHash: string,
  appVersion: bigint,
  delegatees: string[],
  abilityIpfsCids: string[],
  abilityPolicies: string[][],
  network: string,
  chainId: number,
  transactionHash: string,
  blockNumber: bigint
): void {
  const registrationData: RegistrationData = {
    appId: appId.toString(),
    appManagerAddress,
    accountIndexHash,
    appVersion: appVersion.toString(),
    delegatees,
    abilityIpfsCids,
    abilityPolicies,
    network,
    chainId,
    transactionHash,
    blockNumber: blockNumber.toString(),
    timestamp: new Date().toISOString(),
  };

  // Save to packages/frontend/vincent-app-config.json
  const configPath = path.join(__dirname, '..', '..', 'packages', 'frontend', 'vincent-app-config.json');
  fs.writeFileSync(configPath, JSON.stringify(registrationData, null, 2));
  console.log(`Registration data saved to: packages/frontend/vincent-app-config.json`);
}
