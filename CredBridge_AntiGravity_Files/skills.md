# Project: CredBridge (Level 4 Green Belt)
# Core Skills & Tech Stack Requirements

## Frontend
- Framework: React + TypeScript + Vite
- Styling: Tailwind CSS (Mobile-first, highly responsive)
- Fonts: Inter (Google Fonts)
- Icons: lucide-react

## Blockchain & Web3 (Stellar)
- Network: Stellar Testnet
- SDKs: `@stellar/stellar-sdk`, `@stellar/freighter-api`
- Smart Contracts: Soroban (Rust)
- Wallet Integration: Freighter (with Passkey support/fallback for underbanked users)

## Backend & Infrastructure
- Database: Supabase or Firebase (for off-chain metadata, user feedback, analytics)
- API: Node.js / Serverless functions
- Monitoring/Analytics: Vercel Analytics / Sentry (Error Tracking)

## Core Capabilities Needed
- Stellar transaction signing and submission.
- Privacy-preserving data hashing (storing reputation proofs on-chain, raw data off-chain).
- Onboarding flow with minimal friction.
