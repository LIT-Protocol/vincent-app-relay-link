'use client';

interface DefaultsFormProps {
  delegateePrivateKey: string;
  setDelegateePrivateKey: (value: string) => void;
  originChainId: string;
  setOriginChainId: (value: string) => void;
  destinationChainId: string;
  setDestinationChainId: (value: string) => void;
  originCurrency: string;
  setOriginCurrency: (value: string) => void;
  destinationCurrency: string;
  setDestinationCurrency: (value: string) => void;
  tradeType: string;
  setTradeType: (value: string) => void;
  deploymentResult: any;
  embeddedWallet: any;
  ethBalance: string;
  usdcBalance: string;
  loadingBalances: boolean;
  refetch: () => void;
}

export function DefaultsForm({
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
  deploymentResult,
  embeddedWallet,
  ethBalance,
  usdcBalance,
  loadingBalances,
  refetch,
}: DefaultsFormProps) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Defaults</h2>
        <p className="text-sm text-gray-600">
          Apply to all delegators unless overridden
        </p>
      </div>

      {/* Smart Account Info */}
      {deploymentResult?.agentSmartAccountAddress ? (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-blue-900">
              Executing on behalf of Smart Account
            </p>
            <button
              onClick={refetch}
              disabled={loadingBalances}
              className="text-blue-600 hover:text-blue-700 disabled:text-blue-400 transition-colors disabled:cursor-not-allowed"
              title="Refresh balances"
            >
              {loadingBalances ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              ) : (
                <svg
                  className="w-4 h-4"
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
          <div className="space-y-2">
            <div>
              <p className="text-xs text-blue-700 font-medium">
                Smart Account Address:
              </p>
              <p className="text-xs font-mono text-blue-800 break-all">
                {deploymentResult.agentSmartAccountAddress}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-blue-200">
              <div>
                <p className="text-xs text-blue-700 font-medium">ETH Balance:</p>
                <p className="text-sm font-semibold text-blue-900">
                  {ethBalance}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-700 font-medium">USDC Balance:</p>
                <p className="text-sm font-semibold text-blue-900">
                  {usdcBalance}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
          <p className="text-sm text-yellow-800">
            <span className="font-medium">Note:</span> Install the app in User
            view first to create a smart account.
          </p>
        </div>
      )}

      {/* Delegatee Private Key */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Delegatee Private Key *
          {process.env.NEXT_PUBLIC_DELEGATEE_PRIVATE_KEY && (
            <span className="ml-2 text-xs text-gray-500">(Loaded from env)</span>
          )}
        </label>
        <input
          type="text"
          value={delegateePrivateKey}
          onChange={(e) => setDelegateePrivateKey(e.target.value)}
          placeholder="0x..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        {process.env.NEXT_PUBLIC_DELEGATEE_PRIVATE_KEY && (
          <p className="mt-1 text-xs text-yellow-600">
            ⚠️ Using private key from NEXT_PUBLIC_DELEGATEE_PRIVATE_KEY
            (development only)
          </p>
        )}
      </div>

      {/* Defaults Section */}
      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-purple-900 mb-1">
            Defaults (Apply to All Delegators)
          </h3>
          <p className="text-xs text-purple-700">
            These parameters apply to all delegators unless overridden.
          </p>
        </div>

        {/* Chain IDs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-purple-800 mb-1">
              Origin Chain ID
            </label>
            <input
              type="number"
              value={originChainId}
              onChange={(e) => setOriginChainId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-purple-800 mb-1">
              Destination Chain ID
            </label>
            <input
              type="number"
              value={destinationChainId}
              onChange={(e) => setDestinationChainId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Currencies */}
        <div>
          <label className="block text-xs font-medium text-purple-800 mb-1">
            Origin Currency
          </label>
          <input
            type="text"
            value={originCurrency}
            onChange={(e) => setOriginCurrency(e.target.value)}
            placeholder="0x0000000000000000000000000000000000000000 (ETH)"
            className="w-full px-3 py-2 text-sm border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-purple-800 mb-1">
            Destination Currency
          </label>
          <input
            type="text"
            value={destinationCurrency}
            onChange={(e) => setDestinationCurrency(e.target.value)}
            placeholder="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 (USDC)"
            className="w-full px-3 py-2 text-sm border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
          />
        </div>

        {/* Trade Type */}
        <div>
          <label className="block text-xs font-medium text-purple-800 mb-1">
            Trade Type
          </label>
          <select
            value={tradeType}
            onChange={(e) => setTradeType(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="EXACT_INPUT">EXACT_INPUT</option>
            <option value="EXACT_OUTPUT">EXACT_OUTPUT</option>
          </select>
        </div>
      </div>
    </div>
  );
}
