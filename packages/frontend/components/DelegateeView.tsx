'use client';

import { useState } from 'react';
import { useBalances } from '@/hooks/useBalances';

const BASE_CHAIN_ID = 8453;
const ETH_ADDRESS = '0x0000000000000000000000000000000000000000';

interface DelegateeViewProps {
  embeddedWallet: any;
  deploymentResult: any;
}

export function DelegateeView({
  embeddedWallet,
  deploymentResult,
}: DelegateeViewProps) {
  // Defaults
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

  const {
    ethBalance,
    usdcBalance,
    loading: loadingBalances,
    refetch,
  } = useBalances(embeddedWallet?.address);

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
      const abilityParams: any = {
        AMOUNT: amount,
      };

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

  if (!embeddedWallet) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
        <p className="text-yellow-800 text-sm">
          Please connect your wallet to execute abilities as a delegatee.
        </p>
      </div>
    );
  }

  return {
    delegateePrivateKey,
    setDelegateePrivateKey,
    originChainId,
    setOriginChainId,
    destinationChainId,
    setDestinationChainId,
    originCurrency,
    setOriginCurrency,
    destinationCurrency,
    setDestinationCurrency,
    tradeType,
    setTradeType,
    delegatorOriginChainId,
    setDelegatorOriginChainId,
    delegatorDestinationChainId,
    setDelegatorDestinationChainId,
    delegatorOriginCurrency,
    setDelegatorOriginCurrency,
    delegatorDestinationCurrency,
    setDelegatorDestinationCurrency,
    delegatorTradeType,
    setDelegatorTradeType,
    amount,
    setAmount,
    executing,
    executionResult,
    executionError,
    executeAbility,
    ethBalance,
    usdcBalance,
    loadingBalances,
    refetch,
    deploymentResult,
    embeddedWallet,
  };
}
