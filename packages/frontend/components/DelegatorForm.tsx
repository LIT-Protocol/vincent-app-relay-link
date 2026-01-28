'use client';

interface DelegatorFormProps {
  embeddedWallet: any;
  originChainId: string;
  destinationChainId: string;
  tradeType: string;
  delegatorOriginChainId: string;
  setDelegatorOriginChainId: (value: string) => void;
  delegatorDestinationChainId: string;
  setDelegatorDestinationChainId: (value: string) => void;
  delegatorOriginCurrency: string;
  setDelegatorOriginCurrency: (value: string) => void;
  delegatorDestinationCurrency: string;
  setDelegatorDestinationCurrency: (value: string) => void;
  delegatorTradeType: string;
  setDelegatorTradeType: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  executing: boolean;
  executionError: string | null;
  executionResult: any;
  delegateePrivateKey: string;
  executeAbility: () => void;
}

export function DelegatorForm({
  embeddedWallet,
  originChainId,
  destinationChainId,
  tradeType,
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
  executionError,
  executionResult,
  delegateePrivateKey,
  executeAbility,
}: DelegatorFormProps) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Delegator Parameters
        </h2>
        <p className="text-sm text-gray-600">
          Override defaults for this specific delegator
        </p>
      </div>

      {/* Delegator Parameters Section */}
      <div className="p-4 bg-green-50 rounded-lg border border-green-200 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-green-900 mb-1">
            Delegator Parameters (Override Defaults)
          </h3>
          <p className="text-xs text-green-700">
            Set parameters for this specific delegator. Empty fields will use
            defaults above.
          </p>
        </div>

        {/* Delegator Address */}
        <div>
          <label className="block text-xs font-medium text-green-800 mb-1">
            Delegator Address (User&apos;s Privy Wallet)
          </label>
          <div className="px-3 py-2 bg-green-100 border border-green-300 rounded-lg text-xs font-mono text-green-900 break-all">
            {embeddedWallet?.address || 'No wallet connected'}
          </div>
        </div>

        {/* Origin Chain ID */}
        <div>
          <label className="block text-xs font-medium text-green-800 mb-1">
            Origin Chain ID{' '}
            <span className="font-normal text-green-600">(optional)</span>
          </label>
          <input
            type="number"
            value={delegatorOriginChainId}
            onChange={(e) => setDelegatorOriginChainId(e.target.value)}
            placeholder={`Empty = use default (${originChainId})`}
            className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Destination Chain ID */}
        <div>
          <label className="block text-xs font-medium text-green-800 mb-1">
            Destination Chain ID{' '}
            <span className="font-normal text-green-600">(optional)</span>
          </label>
          <input
            type="number"
            value={delegatorDestinationChainId}
            onChange={(e) => setDelegatorDestinationChainId(e.target.value)}
            placeholder={`Empty = use default (${destinationChainId})`}
            className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Origin Currency */}
        <div>
          <label className="block text-xs font-medium text-green-800 mb-1">
            Origin Currency{' '}
            <span className="font-normal text-green-600">(optional)</span>
          </label>
          <input
            type="text"
            value={delegatorOriginCurrency}
            onChange={(e) => setDelegatorOriginCurrency(e.target.value)}
            placeholder="Empty = use default"
            className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
          />
        </div>

        {/* Destination Currency */}
        <div>
          <label className="block text-xs font-medium text-green-800 mb-1">
            Destination Currency{' '}
            <span className="font-normal text-green-600">(optional)</span>
          </label>
          <input
            type="text"
            value={delegatorDestinationCurrency}
            onChange={(e) => setDelegatorDestinationCurrency(e.target.value)}
            placeholder="Empty = use default"
            className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
          />
        </div>

        {/* Trade Type */}
        <div>
          <label className="block text-xs font-medium text-green-800 mb-1">
            Trade Type{' '}
            <span className="font-normal text-green-600">(optional)</span>
          </label>
          <select
            value={delegatorTradeType}
            onChange={(e) => setDelegatorTradeType(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Empty = use default ({tradeType})</option>
            <option value="EXACT_INPUT">EXACT_INPUT</option>
            <option value="EXACT_OUTPUT">EXACT_OUTPUT</option>
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-medium text-green-800 mb-1">
            Amount (in wei){' '}
            <span className="font-normal text-green-600">(Required)</span>
          </label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="10000000000000 (0.00001 ETH)"
            className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
          />
        </div>
      </div>

      {/* Execute Button */}
      <button
        onClick={executeAbility}
        disabled={executing || !delegateePrivateKey}
        className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {executing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>Executing...</span>
          </>
        ) : (
          'Execute Ability'
        )}
      </button>

      {/* Error Display */}
      {executionError && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-100">
          <p className="text-red-600 text-sm">{executionError}</p>
        </div>
      )}

      {/* Result Display */}
      {executionResult && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Execution Result
          </label>
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <pre className="text-xs font-mono text-green-800 overflow-x-auto text-left whitespace-pre">
              {JSON.stringify(executionResult, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
