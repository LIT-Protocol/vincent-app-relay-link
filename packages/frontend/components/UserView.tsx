'use client';

import { useBalances } from '@/hooks/useBalances';

interface UserViewProps {
  embeddedWallet: any;
  deploymentResult: any;
  installingApp: boolean;
  checkingInstallation: boolean;
  installApp: () => void;
  logout: () => void;
}

export function UserView({
  embeddedWallet,
  deploymentResult,
  installingApp,
  checkingInstallation,
  installApp,
  logout,
}: UserViewProps) {
  const {
    ethBalance,
    usdcBalance,
    loading: loadingBalances,
    error: balanceError,
    refetch,
  } = useBalances(embeddedWallet?.address);

  if (!embeddedWallet) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
          <p className="text-gray-600">Creating your wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Privy Account */}
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Privy Account
        </h2>
        <div className="space-y-2 text-left">
          <p className="text-gray-600">
            <span className="font-medium">Wallet Address:</span>
          </p>
          <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">
            {embeddedWallet.address}
          </p>
        </div>
      </div>

      {/* App Installation Section */}
      {!deploymentResult?.agentSmartAccountAddress && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">
              Vincent App
            </h2>
          </div>

          <div className="p-6">
            {checkingInstallation ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                <p className="text-gray-600">
                  Checking installation...
                </p>
              </div>
            ) : deploymentResult?.error ? (
              <div className="space-y-3">
                <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-red-600 text-sm">
                    {deploymentResult.error}
                  </p>
                </div>
                <button
                  onClick={installApp}
                  disabled={installingApp}
                  className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Retry Installation
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={installApp}
                  disabled={installingApp}
                  className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {installingApp ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Installing App...</span>
                    </>
                  ) : (
                    "Install App"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Smart Account Section - Only show after installation */}
      {deploymentResult?.agentSmartAccountAddress && (
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Smart Account
          </h2>

          <div className="space-y-4">
            {/* Smart Account Address */}
            <div className="space-y-2 text-left">
              <p className="text-gray-600">
                <span className="font-medium">
                  Smart Account Address:
                </span>
              </p>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">
                {deploymentResult.agentSmartAccountAddress}
              </p>
            </div>

            {/* Balances */}
            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  <span className="font-medium">Balances:</span>
                </p>
                <button
                  onClick={refetch}
                  disabled={loadingBalances}
                  className="text-orange-600 hover:text-orange-700 disabled:text-gray-400 transition-colors disabled:cursor-not-allowed"
                  title="Refresh balances"
                >
                  {loadingBalances ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-orange-600 border-t-transparent"></div>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {balanceError ? (
                <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-red-600 text-sm">
                    {balanceError}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-100 rounded">
                    <p className="text-sm font-medium text-gray-900">
                      ETH
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {ethBalance}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-gray-100 rounded">
                    <p className="text-sm font-medium text-gray-900">
                      USDC
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {usdcBalance}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={logout}
        className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
      >
        Sign Out
      </button>
    </>
  );
}
