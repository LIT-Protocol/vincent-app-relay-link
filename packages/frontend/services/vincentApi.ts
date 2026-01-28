import { VINCENT_API_URL, APP_ID } from '@/utils/constants';

export interface InstallAppResponse {
  agentSignerAddress: string;
  agentSmartAccountAddress: string;
  appInstallationDataToSign: {
    typedData: any;
  };
  agentSmartAccountDeploymentDataToSign: any;
  sessionKeyApprovalDataToSign: any;
  alreadyInstalled?: boolean;
}

/**
 * Call Vincent API to initiate app installation
 * Uses the correct Vincent Registry API endpoint: POST /user/:appId/install-app
 */
export async function initiateAppInstallation(
  userControllerAddress: string
): Promise<InstallAppResponse> {
  console.log('=== Calling Vincent API Install App ===');
  console.log('App ID:', APP_ID);
  console.log('User Controller Address:', userControllerAddress);

  const response = await fetch(`${VINCENT_API_URL}/user/${APP_ID}/install-app`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userControllerAddress,
      sponsorGas: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Install app request failed: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const data = await response.json();

  console.log('=== Vincent API Install App Response ===');
  console.log('Agent Signer Address:', data.agentSignerAddress);
  console.log('Agent Smart Account Address:', data.agentSmartAccountAddress);

  return data;
}

/**
 * Complete the app installation by submitting the signed typed data to Vincent API
 * Uses the correct Vincent Registry API endpoint: POST /user/:appId/complete-installation
 */
export async function completeAppInstallation(
  userControllerAddress: string,
  appId: number,
  agentSignerAddress: string,
  appInstallation: {
    typedDataSignature: string;
    dataToSign: any;
  },
  agentSmartAccountDeployment: {
    typedDataSignature: string;
    userOperation: any;
  },
  sessionKeyApproval: {
    typedDataSignature: string;
  }
): Promise<{
  deployAgentSmartAccountTransactionHash: string;
  serializedPermissionAccount: string;
  completeAppInstallationTransactionHash: string;
}> {
  console.log('=== Completing Installation ===');

  const response = await fetch(`${VINCENT_API_URL}/user/${appId}/complete-installation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userControllerAddress,
      agentSignerAddress,
      appInstallation,
      agentSmartAccountDeployment,
      sessionKeyApproval,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Complete installation request failed: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const data = await response.json();

  console.log('=== Installation Complete ===');
  console.log('Deploy TX Hash:', data.deployAgentSmartAccountTransactionHash);
  console.log('Install TX Hash:', data.completeAppInstallationTransactionHash);

  return data;
}

/**
 * Get the agent smart account address for a user
 * Uses the Vincent Registry API endpoint: POST /user/:appId/agent-account
 * Returns null if agent is not registered
 */
export async function getAgentAccount(
  userControllerAddress: string
): Promise<string | null> {
  console.log('=== Getting Agent Account ===');
  console.log('User Controller Address:', userControllerAddress);

  const response = await fetch(`${VINCENT_API_URL}/user/${APP_ID}/agent-account`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userControllerAddress }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Get agent account failed: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const data = await response.json();

  console.log('Agent Address:', data.agentAddress);
  return data.agentAddress || null;
}

/**
 * Get agent funds (token balances) across specified networks
 * Uses the Vincent Registry API endpoint: POST /user/:appId/agent-funds
 */
export async function getAgentFunds(
  userControllerAddress: string,
  networks: string[]
): Promise<{
  agentAddress: string;
  tokens: Array<{
    address: string;
    network: string;
    tokenAddress: string;
    tokenBalance: string;
    tokenMetadata?: {
      decimals: number;
      logo: string | null;
      name: string;
      symbol: string;
    };
    tokenPrices?: Array<{
      currency: string;
      value: string;
      lastUpdatedAt: string;
    }>;
    error?: string | null;
  }>;
  pageKey?: string;
}> {
  console.log('=== Getting Agent Funds ===');
  console.log('User Controller Address:', userControllerAddress);
  console.log('Networks:', networks);

  const response = await fetch(`${VINCENT_API_URL}/user/${APP_ID}/agent-funds`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userControllerAddress,
      networks,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Get agent funds failed: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const data = await response.json();

  console.log('Agent Funds:', data);
  return data;
}
