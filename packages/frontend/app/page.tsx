"use client";

import { useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useBalances } from "@/hooks/useBalances";
import { useAppInstallation } from "@/hooks/useAppInstallation";
import vincentAppConfig from "@/vincent-app-config.json";

type ViewMode = "user" | "delegatee";

const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";
const BASE_CHAIN_ID = 8453;

export default function Home() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [viewMode, setViewMode] = useState<ViewMode>("user");

  // Delegatee execution state - Defaults
  const [delegateePrivateKey, setDelegateePrivateKey] = useState(
    process.env.NEXT_PUBLIC_DELEGATEE_PRIVATE_KEY || "",
  );
  const [originChainId, setOriginChainId] = useState(BASE_CHAIN_ID.toString());
  const [destinationChainId, setDestinationChainId] = useState(
    BASE_CHAIN_ID.toString(),
  );
  const [originCurrency, setOriginCurrency] = useState(ETH_ADDRESS);
  const [destinationCurrency, setDestinationCurrency] = useState(
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  ); // USDC
  const [tradeType, setTradeType] = useState("EXACT_INPUT");

  // Delegator-specific overrides (empty string means use default)
  const [delegatorOriginChainId, setDelegatorOriginChainId] = useState("");
  const [delegatorDestinationChainId, setDelegatorDestinationChainId] =
    useState("");
  const [delegatorOriginCurrency, setDelegatorOriginCurrency] = useState("");
  const [delegatorDestinationCurrency, setDelegatorDestinationCurrency] =
    useState("");
  const [delegatorTradeType, setDelegatorTradeType] = useState("");
  const [amount, setAmount] = useState("10000000000000"); // 0.00001 ETH in wei

  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  // Find the Privy embedded wallet (created automatically via createOnLogin config)
  const embeddedWallet = wallets.find(
    (wallet) => wallet.walletClientType === "privy",
  );

  // Fetch balances
  const {
    ethBalance,
    usdcBalance,
    loading: loadingBalances,
    error: balanceError,
    refetch,
  } = useBalances(embeddedWallet?.address);

  // App installation
  const { installingApp, deploymentResult, installApp, checkingInstallation } =
    useAppInstallation(authenticated, embeddedWallet);

  // Fetch balances when smart account is available
  useEffect(() => {
    if (deploymentResult?.agentSmartAccountAddress && embeddedWallet?.address) {
      refetch();
    }
  }, [
    deploymentResult?.agentSmartAccountAddress,
    embeddedWallet?.address,
    refetch,
  ]);

  // Execute relay link ability
  const executeAbility = async () => {
    if (!embeddedWallet?.address) {
      setExecutionError("No wallet connected");
      return;
    }

    if (!delegateePrivateKey) {
      setExecutionError("Delegatee private key is required");
      return;
    }

    setExecuting(true);
    setExecutionError(null);
    setExecutionResult(null);

    try {
      // Build abilityParams with only non-empty delegator overrides
      const abilityParams: any = {
        AMOUNT: amount, // Always required
      };

      // Add optional overrides only if they're set
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
        `${process.env.NEXT_PUBLIC_VINCENT_API_URL || "https://api.heyvincent.ai"}/app/relay-link/execute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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
        throw new Error(errorData.message || "Failed to execute ability");
      }

      const result = await response.json();
      setExecutionResult(result);
    } catch (error) {
      console.error("Error executing ability:", error);
      setExecutionError(
        error instanceof Error ? error.message : "Failed to execute ability",
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
                onClick={() => setViewMode("user")}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                  viewMode === "user"
                    ? "bg-orange-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Vincent User
              </button>
              <button
                onClick={() => setViewMode("delegatee")}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                  viewMode === "delegatee"
                    ? "bg-orange-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Vincent Delegatee
              </button>
            </div>

            {viewMode === "user" ? (
              <>
                {embeddedWallet ? (
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
                ) : (
                  <div className="p-6 bg-white rounded-lg shadow-lg">
                    <div className="flex items-center justify-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                      <p className="text-gray-600">Creating your wallet...</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Delegatee View */
              <div className="space-y-4">
                {/* Top Row - Defaults and Delegator Parameters Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left Column - Defaults */}
                  <div className="p-6 bg-white rounded-lg shadow-lg space-y-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                        Defaults
                      </h2>
                      <p className="text-sm text-gray-600">
                        Apply to all delegators unless overridden
                      </p>
                    </div>

                    {embeddedWallet ? (
                      <div className="space-y-4">
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
                                  <p className="text-xs text-blue-700 font-medium">
                                    ETH Balance:
                                  </p>
                                  <p className="text-sm font-semibold text-blue-900">
                                    {ethBalance}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-blue-700 font-medium">
                                    USDC Balance:
                                  </p>
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
                              <span className="font-medium">Note:</span> Install
                              the app in User view first to create a smart
                              account.
                            </p>
                          </div>
                        )}

                        {/* Delegatee Private Key */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Delegatee Private Key *
                            {process.env.NEXT_PUBLIC_DELEGATEE_PRIVATE_KEY && (
                              <span className="ml-2 text-xs text-gray-500">
                                (Loaded from env)
                              </span>
                            )}
                          </label>
                          <input
                            type="text"
                            value={delegateePrivateKey}
                            onChange={(e) =>
                              setDelegateePrivateKey(e.target.value)
                            }
                            placeholder="0x..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                          {process.env.NEXT_PUBLIC_DELEGATEE_PRIVATE_KEY && (
                            <p className="mt-1 text-xs text-yellow-600">
                              ⚠️ Using private key from
                              NEXT_PUBLIC_DELEGATEE_PRIVATE_KEY (development
                              only)
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
                              These parameters apply to all delegators unless
                              overridden.
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
                                onChange={(e) =>
                                  setOriginChainId(e.target.value)
                                }
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
                                onChange={(e) =>
                                  setDestinationChainId(e.target.value)
                                }
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
                              onChange={(e) =>
                                setOriginCurrency(e.target.value)
                              }
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
                              onChange={(e) =>
                                setDestinationCurrency(e.target.value)
                              }
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

                        {/* Delegator Parameters Section */}
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200 space-y-4">
                          <div>
                            <h3 className="text-sm font-semibold text-green-900 mb-1">
                              Delegator Parameters (Override Defaults)
                            </h3>
                            <p className="text-xs text-green-700">
                              Set parameters for this specific delegator. Empty
                              fields will use defaults above.
                            </p>
                          </div>

                          {/* Delegator Address */}
                          <div>
                            <label className="block text-xs font-medium text-green-800 mb-1">
                              Delegator Address (User&apos;s Privy Wallet)
                            </label>
                            <div className="px-3 py-2 bg-green-100 border border-green-300 rounded-lg text-xs font-mono text-green-900 break-all">
                              {embeddedWallet?.address || "No wallet connected"}
                            </div>
                          </div>

                          {/* Origin Chain ID */}
                          <div>
                            <label className="block text-xs font-medium text-green-800 mb-1">
                              Origin Chain ID{" "}
                              <span className="font-normal text-green-600">
                                (optional)
                              </span>
                            </label>
                            <input
                              type="number"
                              value={delegatorOriginChainId}
                              onChange={(e) =>
                                setDelegatorOriginChainId(e.target.value)
                              }
                              placeholder={`Empty = use default (${originChainId})`}
                              className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>

                          {/* Destination Chain ID */}
                          <div>
                            <label className="block text-xs font-medium text-green-800 mb-1">
                              Destination Chain ID{" "}
                              <span className="font-normal text-green-600">
                                (optional)
                              </span>
                            </label>
                            <input
                              type="number"
                              value={delegatorDestinationChainId}
                              onChange={(e) =>
                                setDelegatorDestinationChainId(e.target.value)
                              }
                              placeholder={`Empty = use default (${destinationChainId})`}
                              className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>

                          {/* Origin Currency */}
                          <div>
                            <label className="block text-xs font-medium text-green-800 mb-1">
                              Origin Currency{" "}
                              <span className="font-normal text-green-600">
                                (optional)
                              </span>
                            </label>
                            <input
                              type="text"
                              value={delegatorOriginCurrency}
                              onChange={(e) =>
                                setDelegatorOriginCurrency(e.target.value)
                              }
                              placeholder="Empty = use default"
                              className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                            />
                          </div>

                          {/* Destination Currency */}
                          <div>
                            <label className="block text-xs font-medium text-green-800 mb-1">
                              Destination Currency{" "}
                              <span className="font-normal text-green-600">
                                (optional)
                              </span>
                            </label>
                            <input
                              type="text"
                              value={delegatorDestinationCurrency}
                              onChange={(e) =>
                                setDelegatorDestinationCurrency(e.target.value)
                              }
                              placeholder="Empty = use default"
                              className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                            />
                          </div>

                          {/* Trade Type */}
                          <div>
                            <label className="block text-xs font-medium text-green-800 mb-1">
                              Trade Type{" "}
                              <span className="font-normal text-green-600">
                                (optional)
                              </span>
                            </label>
                            <select
                              value={delegatorTradeType}
                              onChange={(e) =>
                                setDelegatorTradeType(e.target.value)
                              }
                              className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              <option value="">
                                Empty = use default ({tradeType})
                              </option>
                              <option value="EXACT_INPUT">EXACT_INPUT</option>
                              <option value="EXACT_OUTPUT">EXACT_OUTPUT</option>
                            </select>
                          </div>

                          {/* Amount */}
                          <div>
                            <label className="block text-xs font-medium text-green-800 mb-1">
                              Amount (in wei){" "}
                              <span className="font-normal text-green-600">
                                (Required)
                              </span>
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
                            "Execute Ability"
                          )}
                        </button>

                        {/* Error Display */}
                        {executionError && (
                          <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                            <p className="text-red-600 text-sm">
                              {executionError}
                            </p>
                          </div>
                        )}

                        {/* Result Display */}
                        {executionResult && (
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Execution Result
                            </label>
                            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                              <pre className="text-xs font-mono text-green-800 overflow-x-auto">
                                {JSON.stringify(executionResult, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                        <p className="text-yellow-800 text-sm">
                          Please connect your wallet to execute abilities as a
                          delegatee.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column - cURL Command */}
                  {embeddedWallet &&
                    (() => {
                      // Build abilityParams dynamically based on overrides
                      const abilityParamsObj: any = { AMOUNT: amount };
                      if (delegatorOriginChainId)
                        abilityParamsObj.ORIGIN_CHAIN_ID = parseInt(
                          delegatorOriginChainId,
                        );
                      if (delegatorDestinationChainId)
                        abilityParamsObj.DESTINATION_CHAIN_ID = parseInt(
                          delegatorDestinationChainId,
                        );
                      if (delegatorOriginCurrency)
                        abilityParamsObj.ORIGIN_CURRENCY =
                          delegatorOriginCurrency;
                      if (delegatorDestinationCurrency)
                        abilityParamsObj.DESTINATION_CURRENCY =
                          delegatorDestinationCurrency;
                      if (delegatorTradeType)
                        abilityParamsObj.TRADE_TYPE = delegatorTradeType;

                      // Format for display
                      const abilityParamsDisplay = Object.entries(
                        abilityParamsObj,
                      )
                        .map(
                          ([key, value]) =>
                            `        "${key}": ${typeof value === "string" ? `"${value}"` : value}`,
                        )
                        .join(",\n");

                      // Format for clipboard (compact)
                      const abilityParamsCompact =
                        JSON.stringify(abilityParamsObj);

                      const curlDisplay = `curl -X POST '${process.env.NEXT_PUBLIC_VINCENT_API_URL || "https://api.heyvincent.ai"}/app/relay-link/execute' \\
  -H 'Content-Type: application/json' \\
  -d '{
  "delegateePrivateKey": "${delegateePrivateKey || "YOUR_DELEGATEE_PRIVATE_KEY"}",
  "defaults": {
    "ORIGIN_CHAIN_ID": ${originChainId},
    "DESTINATION_CHAIN_ID": ${destinationChainId},
    "ORIGIN_CURRENCY": "${originCurrency}",
    "DESTINATION_CURRENCY": "${destinationCurrency}",
    "TRADE_TYPE": "${tradeType}"
  },
  "delegators": [
    {
      "delegatorAddress": "${embeddedWallet.address}",
      "abilityParams": {
${abilityParamsDisplay}
      }
    }
  ]
}'`;

                      const curlCompact = `curl -X POST '${process.env.NEXT_PUBLIC_VINCENT_API_URL || "https://api.heyvincent.ai"}/app/relay-link/execute' -H 'Content-Type: application/json' -d '{"delegateePrivateKey":"${delegateePrivateKey}","defaults":{"ORIGIN_CHAIN_ID":${originChainId},"DESTINATION_CHAIN_ID":${destinationChainId},"ORIGIN_CURRENCY":"${originCurrency}","DESTINATION_CURRENCY":"${destinationCurrency}","TRADE_TYPE":"${tradeType}"},"delegators":[{"delegatorAddress":"${embeddedWallet.address}","abilityParams":${abilityParamsCompact}}]}'`;

                      return (
                        <div className="p-6 bg-white rounded-lg shadow-lg">
                          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                            cURL Command
                          </h2>
                          <p className="text-sm text-gray-600 mb-4 text-left">
                            Copy and execute this command to run the ability
                            from your terminal:
                          </p>
                          <div className="relative">
                            <pre className="text-xs font-mono bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-left whitespace-pre">
                              {curlDisplay}
                            </pre>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(curlCompact);
                              }}
                              className="absolute top-2 right-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                              title="Copy to clipboard"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
