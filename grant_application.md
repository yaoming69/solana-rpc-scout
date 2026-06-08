# Superteam Agentic Engineering Grant Application Draft

## Project Name

Solana RPC Scout

## One-Line Summary

A browser-only Solana RPC latency and health profiler that helps builders compare public and
custom RPC endpoints without connecting a wallet.

## What I Am Building

I am building an open-source utility for Solana developers that measures endpoint health,
round-trip latency, slot freshness, and latest blockhash availability across Solana RPC providers.
The MVP runs entirely in the browser and exports a Markdown report that builders can use when
choosing infrastructure for bots, dashboards, wallets, and agent workflows.

## Why This Should Exist

Solana applications are highly sensitive to RPC quality. Builders often need a quick way to compare
providers before they commit to an infra choice, but most tooling is either provider-specific,
requires paid accounts, or is too heavy for a first-pass check. RPC Scout gives developers a
zero-cost, wallet-free baseline that can be extended into a richer infra diagnostics product.

## Solana Integration

The MVP calls Solana JSON-RPC directly:

- `getHealth`
- `getSlot`
- `getLatestBlockhash`

It supports mainnet-beta, devnet, testnet, and custom HTTPS RPC URLs.

## What I Will Ship

- Static web MVP
- Public GitHub repository: https://github.com/yaoming69/solana-rpc-scout
- README with setup instructions
- Exportable Markdown benchmark report
- Short demo video or screenshots showing live scans against Solana RPC endpoints

## How I Will Use AI Tools

I will use AI coding tools to accelerate product iteration, UI polish, test case generation,
documentation, and release packaging. The project scope is intentionally small enough to ship
quickly but practical enough to become useful developer tooling.

## Milestones

1. Ship browser MVP with default Solana endpoints and custom endpoint support.
2. Add repeated sampling and percentile latency.
3. Add JSON/Markdown report export.
4. Publish GitHub repo and demo.
5. Collect feedback from Solana builders and add provider presets.

## Requested Grant

200 USDG under the Agentic Engineering Grants program.

## Current Status

The MVP has been built and published:

- Repository: https://github.com/yaoming69/solana-rpc-scout
- Local demo command: `node .\server.js`
- Local demo URL: `http://localhost:4173`

The tool already supports default Solana Labs endpoints, custom HTTPS RPC endpoints, local JSON-RPC proxying, and Markdown report export.
