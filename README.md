# Solana RPC Scout

Solana RPC Scout is a browser-only latency and health profiler for Solana RPC endpoints.
It helps builders compare public and custom RPC endpoints before they choose infra for a bot,
dashboard, wallet integration, or agent.

## Why This Exists

Solana developers often choose an RPC provider based on brand, price, or hearsay. This small tool
gives them a fast first-pass check:

- health response
- average round-trip latency across core JSON-RPC calls
- current slot freshness
- exportable Markdown report
- no wallet connection and no private keys

## Run Locally

Run the local zero-dependency server. It serves the UI and proxies JSON-RPC calls through
`/rpc`, which avoids browser CORS/Origin blocks from public Solana RPC endpoints.

```powershell
cd D:\36\solana_rpc_scout
node .\server.js
```

Then open:

```text
http://localhost:4173
```

## Current Scope

The MVP calls three Solana JSON-RPC methods:

- `getHealth`
- `getSlot`
- `getLatestBlockhash`

The default endpoints are Solana Labs mainnet, devnet, and testnet. Users can add a custom
HTTPS endpoint from any RPC provider.

## Roadmap

- Add percentile latency from repeated samples
- Add region tagging and historical trend export
- Add optional wallet-free transaction simulation latency checks
- Add a shareable JSON artifact for bounty and grant submissions
- Add provider comparison presets for common Solana infra providers

## Grant Fit

This project is a practical Solana developer utility. It can be shipped quickly, requires no
paid infrastructure, and is a good candidate for the Superteam Agentic Engineering Grant because
it demonstrates AI-assisted shipping of a working Solana product.
