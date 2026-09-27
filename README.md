# ProductPass

A verifiable digital passport for products, built on a local Ethereum blockchain.

ProductPass records the life of a product — manufacturing, sale, warranty and maintenance — in a smart contract. Every participant signs its own operations with its own wallet, and anyone can consult the full history of a product without a wallet.

This is an academic project. It runs entirely on your machine: no external services, no real money, no public network.

---

## Table of contents

1. [Problem](#problem)
2. [Why blockchain](#why-blockchain)
3. [How it works](#how-it-works)
4. [Architecture](#architecture)
5. [On-chain and off-chain data](#on-chain-and-off-chain-data)
6. [Smart contract rules](#smart-contract-rules)
7. [Technologies](#technologies)
8. [Project structure](#project-structure)
9. [Installation](#installation)
10. [Running the project](#running-the-project)
11. [Configuring MetaMask](#configuring-metamask)
12. [Running the tests](#running-the-tests)
13. [Demo flow](#demo-flow)
14. [Troubleshooting](#troubleshooting)

---

## Problem

When a product changes hands — manufacturer, retailer, service center, consumer — its history is spread across the private systems of each company. A consumer who buys a product cannot easily check:

- whether the product was really registered by its manufacturer;
- when it was sold and until when the warranty is valid;
- which maintenance services were performed, and by whom.

Each company can show its own records, but none of them can prove to the others that those records were not changed afterwards.

## Why blockchain

A traditional database would be enough if a single organization controlled the whole process. In that case, everybody would simply trust that organization.

ProductPass uses a blockchain because **several independent participants write to the history of the same product**, and none of them should be the single owner of that history. The blockchain provides:

- **Integrity** — records are validated by the smart contract rules and cannot be silently edited.
- **Traceability** — every event is linked to the product ID and ordered in time.
- **Auditability** — anyone can re-read and verify the entire history.
- **Historical immutability** — each block stores the hash of the previous one, so changing an old record would break every block after it.
- **Accountability** — every operation is signed, so the address responsible for each event is always known.

### What blockchain does not solve

Blockchain protects the **digital record**, not the physical object. It does not, by itself, prevent a counterfeit item from being produced or a genuine label from being copied onto a fake product. It guarantees that the history associated with a product ID was written by authorized participants and has not been altered since. Linking the physical item to its ID securely (tamper-evident tags, NFC chips, inspection) is a separate problem.

## How it works

```text
Admin ──grants roles──▶ Manufacturer, Retailer, Service Center

Manufacturer ──registers product──▶ Retailer ──registers sale──▶ Service Center ──registers maintenance
                                                                                      │
Consumer ◀──────────────── consults product history (no wallet needed) ◀──────────────┘
```

| Participant    | Role in the contract | What it can do                          |
| -------------- | -------------------- | --------------------------------------- |
| Admin          | `Admin`              | Authorize participants (`grantRole`)    |
| Manufacturer   | `Manufacturer`       | Register products                       |
| Retailer       | `Retailer`           | Register sales and start the warranty   |
| Service Center | `ServiceCenter`      | Register maintenance records            |
| Consumer       | none                 | Look up any product and its history     |

## Architecture

```text
┌──────────────────────────── Browser ────────────────────────────┐
│  Next.js app (React + Tailwind)                                  │
│                                                                  │
│  Pages ──▶ hooks ──▶ lib/blockchain ──┬──▶ JsonRpcProvider ──────┼──▶ reads (no wallet)
│                                       └──▶ MetaMask signer ──────┼──▶ transactions
└──────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                 ┌─────────── Hardhat node (localhost:8545) ─────────┐
                 │  ProductPass.sol                                   │
                 │   • roles        • products     • history entries  │
                 │   • events: RoleGranted, ProductRegistered,        │
                 │             ProductSold, MaintenanceRegistered     │
                 └────────────────────────────────────────────────────┘
```

- **Reads** (product lookup, dashboard, explorer) go straight to the local node through a read-only `JsonRpcProvider`, so consumers do not need a wallet.
- **Writes** (register product, sale, maintenance, grant role) are signed in MetaMask and sent through `ethers.js`.
- The **product history** is returned by `getProductHistory` and enriched with the transaction hash of each event, found by filtering the contract events by product.
- The **explorer** reads the latest blocks (number, hash, previous hash, timestamp, transaction count) and the contract events.
- Deploy scripts write the contract address and ABI to `lib/contracts/`, which is how the frontend finds the contract.

## On-chain and off-chain data

**On-chain (stored in the smart contract):**

- product ID, serial number, product name and model;
- manufacturer address;
- manufacturing, sale and warranty expiration timestamps;
- product status and maintenance count;
- maintenance events with a short description;
- the addresses of all participants and their roles.

No personal data is stored on-chain. The consumer is never identified.

**Off-chain (future evolution, not implemented):**

- product images, manuals and large documents;
- consumer personal data;
- invoices.

These belong off-chain because a blockchain is public, permanent and expensive per byte. A future version could store them in regular storage and keep only their hash on-chain to prove they were not modified.

## Smart contract rules

Contract: [`contracts/ProductPass.sol`](contracts/ProductPass.sol)

| Function              | Who can call    | Rules                                                                                                   |
| --------------------- | --------------- | ------------------------------------------------------------------------------------------------------- |
| `grantRole`           | Admin           | Rejects the zero address and roles already granted. The deployer is the first Admin.                    |
| `registerProduct`     | Manufacturer    | Rejects empty product ID, serial number, name or model, and duplicated product IDs.                     |
| `registerSale`        | Retailer        | Product must exist and not be sold yet. Warranty between 1 and 120 months (1 month = 30 days).          |
| `registerMaintenance` | Service Center  | Product must exist. Description is required, up to 140 characters. Increments the maintenance count.   |
| `getProduct`          | Anyone          | Returns the product data. Rejects unknown products.                                                     |
| `getProductHistory`   | Anyone          | Returns every event (type, responsible address, timestamp, details) in order.                           |
| `hasRole`             | Anyone          | Tells whether an address has a role.                                                                     |

Product status: `Manufactured` → `Sold` → `Serviced` (after any maintenance).

Rejected operations revert with short custom errors, which the interface turns into readable messages:

| Error                     | Message shown in the app                              |
| ------------------------- | ----------------------------------------------------- |
| `MissingRole`             | Only accounts with the *Role* role can do this.       |
| `ProductAlreadyExists`    | Product "*ID*" is already registered.                 |
| `ProductNotFound`         | Product "*ID*" was not found.                         |
| `ProductAlreadySold`      | Product "*ID*" has already been sold.                 |
| `EmptyField`              | *Field* is required.                                  |
| `InvalidWarrantyDuration` | Warranty must be between 1 and 120 months.            |
| `DescriptionTooLong`      | Description must have at most 140 characters.         |
| `RoleAlreadyGranted`      | This account already has the *Role* role.             |

## Technologies

| Layer          | Technology                                                     |
| -------------- | -------------------------------------------------------------- |
| Smart contract | Solidity 0.8.28                                                |
| Blockchain     | Hardhat 3 local node (chain ID 31337)                          |
| Tests          | Hardhat + Mocha + Chai (ethers matchers)                       |
| Frontend       | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4  |
| Web3           | ethers.js 6, MetaMask                                          |

## Project structure

```text
contracts/
  ProductPass.sol           Smart contract
scripts/
  deploy.ts                 Deploys the contract
  setupDemo.ts              Deploys, grants demo roles and registers a sample product
  lib/                      Shared deploy helpers
test/
  ProductPass.test.ts       Contract tests
app/                        Next.js pages
  dashboard/  products/  explorer/  register-product/  register-sale/
  register-maintenance/  roles/
components/
  dashboard/  explorer/  forms/  layout/  products/  providers/
  roles/  transactions/  ui/  wallet/
hooks/                      React hooks (async data, transactions, wallet connection)
lib/
  blockchain/               Contract reads, transactions, wallet, error messages
  contracts/                Generated ABI + deployed address (written by the deploy scripts)
  utils/                    Formatting and small helpers
constants/                  Roles, routes, limits and network settings
types/                      Shared TypeScript types
```

## Installation

Requirements:

- [Node.js](https://nodejs.org/) 22 or newer (tested with Node 24)
- [Google Chrome](https://www.google.com/chrome/) or another browser with the [MetaMask](https://metamask.io/) extension

```bash
git clone <repository-url>
cd <repository-folder>
npm install
```

The first compilation downloads the Solidity compiler, so it needs internet once. After that everything runs offline.

## Running the project

Use **two terminals**.

**Terminal 1 — start the local blockchain** (keep it running):

```bash
npm run blockchain
```

It starts a Hardhat node at `http://127.0.0.1:8545` and prints 20 test accounts with their private keys. These accounts hold fake ETH and exist only on your machine.

**Terminal 2 — deploy and prepare the demo:**

```bash
npm run setup
```

This deploys the contract, grants the demo roles and registers the sample product `PP-0001`. It prints the demo accounts:

| Hardhat account | Role           | Address                                      |
| --------------- | -------------- | -------------------------------------------- |
| #0              | Admin          | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` |
| #1              | Manufacturer   | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` |
| #2              | Retailer       | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` |
| #3              | Service Center | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` |

To deploy without the sample product: `SKIP_SAMPLE_PRODUCT=true npm run setup`.
To deploy the contract only, with no roles besides the Admin: `npm run deploy`.

Then start the frontend:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available commands

| Command              | What it does                                        |
| -------------------- | --------------------------------------------------- |
| `npm run blockchain` | Starts the local Hardhat node                        |
| `npm run setup`      | Deploys the contract and prepares the demo data      |
| `npm run deploy`     | Deploys the contract only                            |
| `npm run dev`        | Starts the Next.js frontend in development mode      |
| `npm run test`       | Runs the smart contract tests                        |
| `npm run compile`    | Compiles the contract                                |
| `npm run typecheck`  | Type-checks the whole project                        |
| `npm run build`      | Builds the frontend for production                   |

> The local blockchain lives in memory. Every time you restart `npm run blockchain`, run `npm run setup` again.

## Configuring MetaMask

1. **Add the local network.** Click *Connect Wallet* in the app: if the network is missing, the app offers *Switch to Hardhat Local* and adds it for you. To add it manually, use:

   | Field           | Value                   |
   | --------------- | ----------------------- |
   | Network name    | Hardhat Local           |
   | RPC URL         | `http://127.0.0.1:8545` |
   | Chain ID        | `31337`                 |
   | Currency symbol | `ETH`                   |

2. **Import the demo accounts.** In MetaMask, choose *Add account or hardware wallet → Import account* and paste the private key of accounts **#0 to #3** printed by `npm run blockchain`. Rename them *Admin*, *Manufacturer*, *Retailer* and *Service Center* to switch between them easily during the demo.

   > These keys are public Hardhat test keys. Never send real funds to them and never use them on a real network.

3. **Connect.** Click *Connect Wallet*. The header shows the connected address and its role. Switching accounts in MetaMask updates the role automatically.

## Running the tests

```bash
npm run test
```

The tests run on an in-memory Hardhat network (no need to start the node) and cover:

- **Valid operations:** admin grants manufacturer, retailer and service center roles; manufacturer registers a product; retailer registers a sale; service center registers maintenance; product data and history can be queried.
- **Invalid operations:** duplicated product, unauthorized registration, unauthorized sale, unauthorized maintenance, sale of a nonexistent product, maintenance of a nonexistent product, duplicated sale, empty fields, invalid warranty, long description, non-admin role grant.

Each test starts from its own fixture snapshot, so tests are independent.

## Demo flow

About five minutes, with `npm run blockchain`, `npm run setup` and `npm run dev` running.

1. **Connect the wallet.** Select the *Manufacturer* account in MetaMask and click *Connect Wallet*. The dashboard shows the address, the role *Manufacturer* and the network status.
2. **Register a product.** Go to *Register Product*, fill in `PP-0002`, `SN-2026-000002`, `Aurora Smartwatch`, `AW-200` and click *Register Product*. Confirm in MetaMask.
3. **See the confirmation.** The page shows the block number and the transaction hash.
4. **Look up the product.** Click *View product*. Status is *Manufactured*, warranty *Not started*, and the timeline shows *Product Registered*.
5. **Register the sale.** Switch MetaMask to the *Retailer* account, click *Register sale* on the product page (the ID is filled in), keep 12 months and confirm.
6. **Look up again.** Status is now *Sold*, the warranty is *Active* and has an expiration date, and the timeline shows *Product Sold*.
7. **Register maintenance.** Switch to the *Service Center* account, click *Register maintenance*, describe the service (e.g. `Battery replaced`) and confirm.
8. **View the timeline.** The product page shows *Product Registered → Product Sold → Maintenance Registered*, each with timestamp, responsible address and transaction hash.
9. **Try a duplicated product.** Switch back to *Manufacturer*, open *Register Product* and submit `PP-0002` again.
10. **See the rejection.** The app shows *Operation rejected — Product "PP-0002" is already registered.* Nothing is written to the blockchain.

Extra points to show:

- With the *Retailer* account on *Register Product*, the app warns that the account lacks the role, and the contract rejects the transaction if you submit anyway.
- The *Blockchain Explorer* shows that the *Previous hash* of each block equals the *Hash* of the block below it — the chain that makes the history tamper-evident.
- *Product Lookup* works with MetaMask disconnected: the consumer needs no wallet.
- *Participants* (Admin account) lets you authorize a new address and lists every role granted.

## Troubleshooting

| Symptom                                                   | Fix                                                                                                                                  |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| "The local blockchain is not available"                   | Start it with `npm run blockchain`.                                                                                                   |
| "ProductPass contract not found"                          | The node was restarted. Run `npm run setup` again.                                                                                    |
| "MetaMask is connected to the wrong network"              | Click *Switch to Hardhat Local*.                                                                                                      |
| MetaMask shows *nonce too high* or transactions hang      | The node was restarted but MetaMask kept the old history. In MetaMask: *Settings → Advanced → Clear activity tab data*, for each account. |
| "MetaMask is not installed"                               | Install the MetaMask extension. Lookup and explorer still work without it.                                                           |
