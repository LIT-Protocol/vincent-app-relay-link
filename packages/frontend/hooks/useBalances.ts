'use client';

import { useState, useCallback } from 'react';
import { formatUnits } from 'viem';
import { getAgentFunds } from '@/services/vincentApi';
import { USDC_ADDRESS } from '@/utils/constants';

export function useBalances(userControllerAddress: string | undefined) {
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [usdcBalance, setUsdcBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!userControllerAddress) {
      setError('No user controller address provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch balances from Vincent API (uses Alchemy under the hood)
      const fundsData = await getAgentFunds(userControllerAddress, ['base-mainnet']);

      // Find ETH balance (native token with no tokenAddress)
      const ethToken = fundsData.tokens.find(
        (token) => token.network === 'base-mainnet' && !token.tokenAddress
      );
      if (ethToken && ethToken.tokenMetadata) {
        const ethFormatted = formatUnits(
          BigInt(ethToken.tokenBalance),
          ethToken.tokenMetadata.decimals
        );
        setEthBalance(parseFloat(ethFormatted).toFixed(18));
      }

      // Find USDC balance
      const usdcToken = fundsData.tokens.find(
        (token) =>
          token.network === 'base-mainnet' &&
          token.tokenAddress &&
          token.tokenAddress.toLowerCase() === USDC_ADDRESS.toLowerCase()
      );
      if (usdcToken && usdcToken.tokenMetadata) {
        const usdcFormatted = formatUnits(
          BigInt(usdcToken.tokenBalance),
          usdcToken.tokenMetadata.decimals
        );
        setUsdcBalance(parseFloat(usdcFormatted).toFixed(6));
      }
    } catch (err) {
      console.error('Error fetching balances:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch balances');
    } finally {
      setLoading(false);
    }
  }, [userControllerAddress]);

  return {
    ethBalance,
    usdcBalance,
    loading,
    error,
    refetch: fetchBalances,
  };
}
