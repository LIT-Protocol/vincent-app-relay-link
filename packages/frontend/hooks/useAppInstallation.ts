'use client';

import { useState, useEffect } from 'react';
import { useSignTypedData, useSignMessage } from '@privy-io/react-auth';
import {
  initiateAppInstallation,
  completeAppInstallation,
  getAgentAccount,
} from '@/services/vincentApi';
import { APP_ID } from '@/utils/constants';

export interface DeploymentResult {
  agentSmartAccountAddress?: string;
  agentSignerAddress?: string;
  controllingWalletAddress?: string;
  transactionHash?: string;
  timestamp: string;
  error?: string;
}

/**
 * Hook to handle Vincent app installation using the Vincent Registry API
 *
 * Installation flow:
 * 1. Call /user/:appId/install-app to get data to sign
 * 2. Sign three pieces of data:
 *    - App installation EIP-712 typed data (for permitAppVersion)
 *    - Smart account deployment message (UserOperation hash)
 *    - Session key approval EIP-712 typed data (permission account)
 * 3. Call /user/:appId/complete-installation with all signatures
 */
export function useAppInstallation(authenticated: boolean, embeddedWallet: any) {
  const [installingApp, setInstallingApp] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [checkingInstallation, setCheckingInstallation] = useState(false);
  const { signTypedData } = useSignTypedData();
  const { signMessage } = useSignMessage();

  /**
   * Install the Vincent app for the current user
   */
  const installApp = async () => {
    if (!embeddedWallet) {
      console.error('No embedded wallet found');
      return;
    }

    console.log('=== Installing App ===');
    setInstallingApp(true);
    setDeploymentResult(null);

    try {
      // Step 1: Call Vincent API to initiate installation
      console.log('Step 1: Initiating installation...');
      const installData = await initiateAppInstallation(embeddedWallet.address);

      if (installData.alreadyInstalled) {
        console.log('App is already installed');
        setDeploymentResult({
          agentSmartAccountAddress: installData.agentSmartAccountAddress,
          agentSignerAddress: installData.agentSignerAddress,
          controllingWalletAddress: embeddedWallet.address,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Step 2a: Sign the app installation EIP-712 typed data
      console.log('Step 2a: Signing app installation typed data...');
      const appInstallationTypedData = installData.appInstallationDataToSign.typedData;

      const appInstallationSigResponse = await signTypedData(
        appInstallationTypedData,
        { address: embeddedWallet.address }
      );

      const appInstallationSignature =
        typeof appInstallationSigResponse === 'string'
          ? appInstallationSigResponse
          : (appInstallationSigResponse as any).signature;

      console.log('✓ App installation typed data signed');

      // Step 2b: Sign the smart account deployment message (UserOperation hash)
      console.log('Step 2b: Signing smart account deployment message...');
      const deploymentMessageToSign = installData.agentSmartAccountDeploymentDataToSign.messageToSign;

      const deploymentSigResponse = await signMessage(
        { message: deploymentMessageToSign },
        { address: embeddedWallet.address }
      );

      const agentSmartAccountDeploymentSignature =
        typeof deploymentSigResponse === 'string'
          ? deploymentSigResponse
          : (deploymentSigResponse as any).signature;

      console.log('✓ Smart account deployment message signed');

      // Step 2c: Sign the session key approval EIP-712 typed data
      console.log('Step 2c: Signing session key approval typed data...');
      const sessionKeyApprovalTypedData = installData.sessionKeyApprovalDataToSign;

      const sessionKeySigResponse = await signTypedData(
        sessionKeyApprovalTypedData,
        { address: embeddedWallet.address }
      );

      const sessionKeyApprovalSignature =
        typeof sessionKeySigResponse === 'string'
          ? sessionKeySigResponse
          : (sessionKeySigResponse as any).signature;

      console.log('✓ Session key approval typed data signed');

      // Step 3: Submit all signatures to Vincent API to complete installation
      console.log('Step 3: Completing installation...');
      const completionData = await completeAppInstallation(
        embeddedWallet.address, // userControllerAddress
        parseInt(APP_ID),
        installData.agentSignerAddress,
        {
          typedDataSignature: appInstallationSignature,
          dataToSign: installData.appInstallationDataToSign,
        },
        {
          typedDataSignature: agentSmartAccountDeploymentSignature,
          userOperation: installData.agentSmartAccountDeploymentDataToSign.userOperation,
        },
        {
          typedDataSignature: sessionKeyApprovalSignature,
        }
      );

      const result: DeploymentResult = {
        agentSmartAccountAddress: installData.agentSmartAccountAddress,
        agentSignerAddress: installData.agentSignerAddress,
        controllingWalletAddress: embeddedWallet.address,
        transactionHash: completionData.completeAppInstallationTransactionHash,
        timestamp: new Date().toISOString(),
      };

      setDeploymentResult(result);

      console.log('=== App Installation Complete ===');
      console.log('Agent Smart Account:', installData.agentSmartAccountAddress);
      console.log('Agent Signer:', installData.agentSignerAddress);
      console.log('Deploy TX:', completionData.deployAgentSmartAccountTransactionHash);
      console.log('Install TX:', completionData.completeAppInstallationTransactionHash);
    } catch (error) {
      console.error('Error installing app:', error);
      setDeploymentResult({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setInstallingApp(false);
    }
  };

  // Check if app is already installed when user authenticates
  useEffect(() => {
    const checkAppInstallation = async () => {
      if (!authenticated || !embeddedWallet) return;

      try {
        setCheckingInstallation(true);

        // Check if the agent account exists for this user
        const agentAddress = await getAgentAccount(embeddedWallet.address);

        if (agentAddress) {
          console.log('App is already installed, agent address:', agentAddress);
          setDeploymentResult({
            agentSmartAccountAddress: agentAddress,
            controllingWalletAddress: embeddedWallet.address,
            timestamp: new Date().toISOString(),
          });
        } else {
          console.log('App is not installed yet');
        }
      } catch (error) {
        console.error('Error checking app installation:', error);
      } finally {
        setCheckingInstallation(false);
      }
    };

    checkAppInstallation();
  }, [authenticated, embeddedWallet]);

  return {
    installingApp,
    deploymentResult,
    checkingInstallation,
    installApp,
  };
}
