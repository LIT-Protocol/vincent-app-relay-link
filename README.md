# Vincent App Relay Link

A showcase application demonstrating Vincent app installation and cross-chain swaps using the Relay.link integration.

## Overview

This app demonstrates:
- User authentication using Privy (creates embedded EOA wallet)
- Vincent app installation flow (3-signature process)
- Cross-chain token swaps via Relay.link
- Direct integration with Vincent Registry API

## Structure

- `packages/frontend` - Next.js application with Privy authentication
- `scripts/` - App registration scripts for Vincent Registry

## Prerequisites

1. **Environment Setup**: Copy `.env.local.example` to `.env.local` and configure:
   - Vincent Registry chain configuration (Base Sepolia for testnet)
   - Smart Account chain configuration (Base Mainnet)
   - Private keys for funder, app manager, and app delegatee
   - Privy app ID from [Privy Dashboard](https://dashboard.privy.io)

2. **Register App**: Run the registration script to register your app with Vincent Registry:
   ```bash
   pnpm register-app
   ```
   This will output an `APP_ID` that you need to add to your `.env.local` as `NEXT_PUBLIC_APP_ID`

## Getting Started

Install dependencies:
```bash
pnpm install
```

Run the frontend in development mode:
```bash
pnpm dev
```

The app will be available at http://localhost:3000

## Build

```bash
pnpm build
```

## Architecture

The application communicates directly with the Vincent Registry API (no custom backend needed):
- `/user/:appId/install-app` - Initiates app installation and returns data to sign
- `/user/:appId/complete-installation` - Completes installation with all signatures
- `/app/relay-link-swap/execute` - Executes cross-chain swaps via the Relay.link ability
