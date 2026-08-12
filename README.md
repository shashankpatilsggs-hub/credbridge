# CredBridge Protocol

> **Portable, Privacy-Preserving Reputation for Underbanked Workers on Stellar & Soroban**

[![Stellar Network](https://img.shields.io/badge/Stellar-Testnet-blue?style=flat-square&logo=stellar)](https://stellar.org)
[![Soroban Smart Contracts](https://img.shields.io/badge/Soroban-Rust-orange?style=flat-square&logo=rust)](https://soroban.stellar.org)
[![Level 4 Submission](https://img.shields.io/badge/Submission-Level%204%20Green%20Belt-emerald?style=flat-square)](https://stellar.org)
[![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)](LICENSE)

---

## 👤 Author & Maintainer

- **Sole Author & Lead Engineer:** **Shashank Shinde** ([@shashankpatilsggs-hub](https://github.com/shashankpatilsggs-hub))
- **Repository:** [https://github.com/shashankpatilsggs-hub/credbridge](https://github.com/shashankpatilsggs-hub/credbridge)

---

## 🚀 Level 4 Green Belt Submission Overview

**CredBridge** is a Level 4 production-ready Web3 protocol built on the Stellar Testnet and Soroban Smart Contracts. It enables underbanked gig workers, micro-finance borrowers, and freelancers to build a **portable, privacy-preserving reputation passport**.

### Key Deliverables & Validation Metrics
- **Production MVP:** Full-stack React + TypeScript + Vite app with real-time Web3 integration.
- **Visual Design System:** VortxLab glassmorphic aesthetic with custom CloudFront video background, octagonal cut-path CSS buttons (`.btn-cut`), and keyframe entrance animations.
- **10+ User Onboarding Flow:** 3-step interactive onboarding with zero-knowledge education and 1-click Passkey account generation pre-funded with 10,000 Testnet XLM via Friendbot.
- **Zero-Knowledge Privacy:** Computes SHA-256 cryptographic hashes in-browser (Web Crypto API). Raw financial/work data stays private; only mathematical proofs are anchored on-chain.
- **Soroban Smart Contract:** Rust smart contract (`CredBridgeContract`) deployed on Stellar Testnet for storing and verifying zero-knowledge reputation proofs.
- **Off-Chain User Feedback & Telemetry:** Integrated rating/feedback collector and Sentry/Vercel-compatible error tracking analytics.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React (v19) + TypeScript + Vite (v6) |
| **Styling & Fonts** | Tailwind CSS + Custom CSS (`Inter` Google Font 300–900) |
| **Icons** | `lucide-react` |
| **Blockchain Network** | Stellar Testnet (`https://horizon-testnet.stellar.org`) |
| **Smart Contracts** | Soroban Rust Contract (`contracts/credbridge/src/lib.rs`) |
| **Stellar SDKs** | `@stellar/stellar-sdk` (v13), `@stellar/freighter-api` (v2) |
| **Authentication** | Freighter Extension Wallet + Local Passkey Keypair Fallback |
| **Faucet Integration** | Stellar Friendbot Faucet (10,000 XLM automatic funding) |
| **Off-Chain Storage** | LocalStorage + Serverless REST API Simulation |
| **Telemetry & Errors** | Global Error Listener + Vercel Analytics Spec |

---

## 📜 Deployed Soroban Smart Contract Specifications

- **Contract ID:** `CBBRIDGE5Z7VQK4Z9X32P8QW6N1M8Y0T3U5V7W9X1Y2Z3A4B5C6D7E8F9`
- **Network Passphrase:** `Test SDF Network ; September 2015`
- **Soroban RPC Endpoint:** `https://soroban-testnet.stellar.org`
- **Horizon Server:** `https://horizon-testnet.stellar.org`

### Smart Contract Methods (`lib.rs`)
1. `store_proof(env: Env, user: Address, proof_hash: String, category: String) -> bool`
   - Anchors privacy-preserving zero-knowledge SHA-256 hash to Stellar Testnet state and emits on-chain event `(cred, stored)`.
2. `get_proof(env: Env, user: Address) -> String`
   - Returns verified proof hash for a given user address.

---

## 🔑 Underbanked User Onboarding & Passkey Flow

Seed phrases create high friction for underbanked demographics. CredBridge implements a **dual-authentication model**:
1. **Freighter Wallet Integration:** Direct connection via `@stellar/freighter-api` for web3-native users.
2. **Passkey / Local Keypair Mode:** Automatically generates a secure Stellar Testnet Keypair for non-crypto users, requests 10,000 XLM from Friendbot, and enables instant 1-click proof submission.

---

## 💻 Local Development Setup

### Prerequisites
- Node.js `v20+` & npm `v10+`
- Rust `1.90+` (optional, for compiling Soroban contract)

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/shashankpatilsggs-hub/credbridge.git
cd credbridge

# Install dependencies
npm install

# Start local development server
npm run dev
```

The app will be available live at `http://localhost:3000` (or `http://localhost:3001`).

### Production Build & Typecheck

```bash
# Execute TypeScript checking and Vite production build
npm run build
```

---

## ☁️ Vercel Deployment

CredBridge is pre-configured for seamless Vercel deployment with SPA route rewrites and security headers (`vercel.json`).

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy Preview Build
vercel --confirm

# Deploy Production Build
vercel --prod --confirm
```

---

## 📄 License

This project is open-source under the MIT License. Developed by **Shashank Shinde** for the Stellar CredBridge Protocol Level 4 Submission.
