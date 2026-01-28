'use client';

import { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useBalances } from '@/hooks/useBalances';
import { useAppInstallation } from '@/hooks/useAppInstallation';
import { UserView } from '@/components/UserView';
import { DefaultsForm } from '@/components/DefaultsForm';
import { DelegatorForm } from '@/components/DelegatorForm';
import { CurlCommand } from '@/components/CurlCommand';

type ViewMode = 'user' | 'delegatee';

const ETH_ADDRESS = '0x0000000000000000000000000000000000000000';
const BASE_CHAIN_ID = 8453;

export default function Home() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [viewMode, setViewMode] = useState<ViewMode>('user');

  // Delegatee execution state - Defaults
  const [delegateePrivateKey, setDelegateePrivateKey] = useState(
    process.env.NEXT_PUBLIC_DELEGATEE_PRIVATE_KEY || '',
  );
  const [originChainId, setOriginChainId] = useState(BASE_CHAIN_ID.toString());
  const [destinationChainId, setDestinationChainId] = useState(
    BASE_CHAIN_ID.toString(),
  );
  const [originCurrency, setOriginCurrency] = useState(ETH_ADDRESS);
  const [destinationCurrency, setDestinationCurrency] = useState(
    '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  );
  const [tradeType, setTradeType] = useState('EXACT_INPUT');

  // Delegator-specific overrides
  const [delegatorOriginChainId, setDelegatorOriginChainId] = useState('');
  const [delegatorDestinationChainId, setDelegatorDestinationChainId] =
    useState('');
  const [delegatorOriginCurrency, setDelegatorOriginCurrency] = useState('');
  const [delegatorDestinationCurrency, setDelegatorDestinationCurrency] =
    useState('');
  const [delegatorTradeType, setDelegatorTradeType] = useState('');
  const [amount, setAmount] = useState('10000000000000');

  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  const embeddedWallet = wallets.find(
    (wallet) => wallet.walletClientType === 'privy',
  );

  const {
    ethBalance,
    usdcBalance,
    loading: loadingBalances,
    refetch,
  } = useBalances(embeddedWallet?.address);

  const { installingApp, deploymentResult, installApp, checkingInstallation } =
    useAppInstallation(authenticated, embeddedWallet);

  const executeAbility = async () => {
    if (!embeddedWallet?.address) {
      setExecutionError('No wallet connected');
      return;
    }

    if (!delegateePrivateKey) {
      setExecutionError('Delegatee private key is required');
      return;
    }

    setExecuting(true);
    setExecutionError(null);
    setExecutionResult(null);

    try {
      // Build abilityParams - only include params that are actually set per-delegator
      const abilityParams: any = {};

      // Always include AMOUNT (required per-delegator)
      if (amount) {
        abilityParams.AMOUNT = amount;
      }

      // Only include optional overrides if they're explicitly set
      if (delegatorOriginChainId) {
        abilityParams.ORIGIN_CHAIN_ID = parseInt(delegatorOriginChainId);
      }
      if (delegatorDestinationChainId) {
        abilityParams.DESTINATION_CHAIN_ID = parseInt(
          delegatorDestinationChainId,
        );
      }
      if (delegatorOriginCurrency) {
        abilityParams.ORIGIN_CURRENCY = delegatorOriginCurrency;
      }
      if (delegatorDestinationCurrency) {
        abilityParams.DESTINATION_CURRENCY = delegatorDestinationCurrency;
      }
      if (delegatorTradeType) {
        abilityParams.TRADE_TYPE = delegatorTradeType;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_VINCENT_API_URL || 'https://api.heyvincent.ai'}/app/relay-link/execute`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            delegateePrivateKey,
            defaults: {
              ORIGIN_CHAIN_ID: parseInt(originChainId),
              DESTINATION_CHAIN_ID: parseInt(destinationChainId),
              ORIGIN_CURRENCY: originCurrency,
              DESTINATION_CURRENCY: destinationCurrency,
              TRADE_TYPE: tradeType,
            },
            delegators: [
              {
                delegatorAddress: embeddedWallet.address,
                abilityParams,
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to execute ability');
      }

      const result = await response.json();
      setExecutionResult(result);
    } catch (error) {
      console.error('Error executing ability:', error);
      setExecutionError(
        error instanceof Error ? error.message : 'Failed to execute ability',
      );
    } finally {
      setExecuting(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <main className="text-center space-y-6 p-8 w-full max-w-7xl">
        <h1 className="text-5xl font-bold text-gray-800">
          Vincent App Relay Link
        </h1>

        {!authenticated ? (
          <div className="mt-8 p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Sign In to Get Started
            </h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet or sign in with email to access Vincent App
            </p>
            <button
              onClick={login}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-center gap-2 p-1 bg-white rounded-lg shadow-lg">
              <button
                onClick={() => setViewMode('user')}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                  viewMode === 'user'
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Vincent User
              </button>
              <button
                onClick={() => setViewMode('delegatee')}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                  viewMode === 'delegatee'
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Vincent Delegatee
              </button>
            </div>

            {viewMode === 'user' ? (
              <UserView
                embeddedWallet={embeddedWallet}
                deploymentResult={deploymentResult}
                installingApp={installingApp}
                checkingInstallation={checkingInstallation}
                installApp={installApp}
                logout={logout}
              />
            ) : (
              /* Delegatee View */
              <div className="space-y-4">
                {/* Top Row - Defaults and Delegator Parameters Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <DefaultsForm
                    delegateePrivateKey={delegateePrivateKey}
                    setDelegateePrivateKey={setDelegateePrivateKey}
                    originChainId={originChainId}
                    setOriginChainId={setOriginChainId}
                    destinationChainId={destinationChainId}
                    setDestinationChainId={setDestinationChainId}
                    originCurrency={originCurrency}
                    setOriginCurrency={setOriginCurrency}
                    destinationCurrency={destinationCurrency}
                    setDestinationCurrency={setDestinationCurrency}
                    tradeType={tradeType}
                    setTradeType={setTradeType}
                    deploymentResult={deploymentResult}
                    embeddedWallet={embeddedWallet}
                    ethBalance={ethBalance}
                    usdcBalance={usdcBalance}
                    loadingBalances={loadingBalances}
                    refetch={refetch}
                  />

                  <DelegatorForm
                    embeddedWallet={embeddedWallet}
                    originChainId={originChainId}
                    destinationChainId={destinationChainId}
                    tradeType={tradeType}
                    delegatorOriginChainId={delegatorOriginChainId}
                    setDelegatorOriginChainId={setDelegatorOriginChainId}
                    delegatorDestinationChainId={delegatorDestinationChainId}
                    setDelegatorDestinationChainId={
                      setDelegatorDestinationChainId
                    }
                    delegatorOriginCurrency={delegatorOriginCurrency}
                    setDelegatorOriginCurrency={setDelegatorOriginCurrency}
                    delegatorDestinationCurrency={delegatorDestinationCurrency}
                    setDelegatorDestinationCurrency={
                      setDelegatorDestinationCurrency
                    }
                    delegatorTradeType={delegatorTradeType}
                    setDelegatorTradeType={setDelegatorTradeType}
                    amount={amount}
                    setAmount={setAmount}
                    executing={executing}
                    executionError={executionError}
                    executionResult={executionResult}
                    delegateePrivateKey={delegateePrivateKey}
                    executeAbility={executeAbility}
                  />
                </div>

                {/* Bottom Row - cURL Command */}
                <CurlCommand
                  embeddedWallet={embeddedWallet}
                  delegateePrivateKey={delegateePrivateKey}
                  originChainId={originChainId}
                  destinationChainId={destinationChainId}
                  originCurrency={originCurrency}
                  destinationCurrency={destinationCurrency}
                  tradeType={tradeType}
                  amount={amount}
                  delegatorOriginChainId={delegatorOriginChainId}
                  delegatorDestinationChainId={delegatorDestinationChainId}
                  delegatorOriginCurrency={delegatorOriginCurrency}
                  delegatorDestinationCurrency={delegatorDestinationCurrency}
                  delegatorTradeType={delegatorTradeType}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
