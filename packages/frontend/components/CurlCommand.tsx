'use client';

interface CurlCommandProps {
  embeddedWallet: any;
  delegateePrivateKey: string;
  originChainId: string;
  destinationChainId: string;
  originCurrency: string;
  destinationCurrency: string;
  tradeType: string;
  amount: string;
  delegatorOriginChainId: string;
  delegatorDestinationChainId: string;
  delegatorOriginCurrency: string;
  delegatorDestinationCurrency: string;
  delegatorTradeType: string;
}

export function CurlCommand({
  embeddedWallet,
  delegateePrivateKey,
  originChainId,
  destinationChainId,
  originCurrency,
  destinationCurrency,
  tradeType,
  amount,
  delegatorOriginChainId,
  delegatorDestinationChainId,
  delegatorOriginCurrency,
  delegatorDestinationCurrency,
  delegatorTradeType,
}: CurlCommandProps) {
  if (!embeddedWallet) return null;

  // Build abilityParams dynamically based on overrides
  const abilityParamsObj: any = { AMOUNT: amount };
  if (delegatorOriginChainId)
    abilityParamsObj.ORIGIN_CHAIN_ID = parseInt(delegatorOriginChainId);
  if (delegatorDestinationChainId)
    abilityParamsObj.DESTINATION_CHAIN_ID = parseInt(
      delegatorDestinationChainId,
    );
  if (delegatorOriginCurrency)
    abilityParamsObj.ORIGIN_CURRENCY = delegatorOriginCurrency;
  if (delegatorDestinationCurrency)
    abilityParamsObj.DESTINATION_CURRENCY = delegatorDestinationCurrency;
  if (delegatorTradeType) abilityParamsObj.TRADE_TYPE = delegatorTradeType;

  // Format for display
  const abilityParamsDisplay = Object.entries(abilityParamsObj)
    .map(
      ([key, value]) =>
        `        "${key}": ${typeof value === "string" ? `"${value}"` : value}`,
    )
    .join(",\n");

  // Format for clipboard (compact)
  const abilityParamsCompact = JSON.stringify(abilityParamsObj);

  const apiUrl =
    process.env.NEXT_PUBLIC_VINCENT_API_URL || "https://api.heyvincent.ai";

  const curlDisplay = `curl -X POST '${apiUrl}/app/relay-link/execute' \\
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

  const curlCompact = `curl -X POST '${apiUrl}/app/relay-link/execute' -H 'Content-Type: application/json' -d '{"delegateePrivateKey":"${delegateePrivateKey}","defaults":{"ORIGIN_CHAIN_ID":${originChainId},"DESTINATION_CHAIN_ID":${destinationChainId},"ORIGIN_CURRENCY":"${originCurrency}","DESTINATION_CURRENCY":"${destinationCurrency}","TRADE_TYPE":"${tradeType}"},"delegators":[{"delegatorAddress":"${embeddedWallet.address}","abilityParams":${abilityParamsCompact}}]}'`;

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">
        cURL Command
      </h2>
      <p className="text-sm text-gray-600 mb-4 text-left">
        Copy and execute this command to run the ability from your terminal:
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
}
