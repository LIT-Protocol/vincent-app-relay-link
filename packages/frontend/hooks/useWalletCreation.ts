'use client';

import { useEffect, useState, useRef } from 'react';
import { useCreateWallet } from '@privy-io/react-auth';

export function useWalletCreation(authenticated: boolean, hasEmbeddedWallet: boolean) {
  const [creatingWallet, setCreatingWallet] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const hasAttemptedCreationRef = useRef(false);
  const creationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleWalletCreationError = (error: any) => {
    console.error('Wallet creation error:', error);

    // Check if the error is because the wallet already exists
    if (error?.message?.includes('already has an embedded wallet')) {
      console.log('Wallet already exists, ignoring error');
      setCreatingWallet(false);
      setWalletError(null);
      return;
    }

    setCreatingWallet(false);
    setWalletError(error?.message || 'Failed to create wallet');
  };

  const { createWallet } = useCreateWallet({
    onSuccess: ({ wallet }) => {
      console.log('Wallet created successfully:', wallet);
      setCreatingWallet(false);
      setWalletError(null);

      // Clear timeout if wallet was created successfully
      if (creationTimeoutRef.current) {
        clearTimeout(creationTimeoutRef.current);
        creationTimeoutRef.current = null;
      }
    },
    onError: handleWalletCreationError,
  });

  const attemptCreateWallet = () => {
    if (hasAttemptedCreationRef.current || creatingWallet) {
      return;
    }

    hasAttemptedCreationRef.current = true;
    setCreatingWallet(true);
    setWalletError(null);

    // Set a timeout for wallet creation (30 seconds)
    creationTimeoutRef.current = setTimeout(() => {
      if (creatingWallet && !hasEmbeddedWallet) {
        console.error('Wallet creation timed out');
        setWalletError('Wallet creation timed out. Please try again.');
        setCreatingWallet(false);
        hasAttemptedCreationRef.current = false;
      }
    }, 30000);

    createWallet();
  };

  useEffect(() => {
    if (authenticated && !hasEmbeddedWallet && !hasAttemptedCreationRef.current) {
      attemptCreateWallet();
    }
  }, [authenticated, hasEmbeddedWallet]);

  const retryWalletCreation = () => {
    hasAttemptedCreationRef.current = false;
    attemptCreateWallet();
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (creationTimeoutRef.current) {
        clearTimeout(creationTimeoutRef.current);
      }
    };
  }, []);

  return {
    creatingWallet,
    walletError,
    retryWalletCreation,
  };
}
