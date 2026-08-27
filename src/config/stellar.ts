import { Networks } from '@stellar/stellar-sdk';

/**
 * PHASE 1: Unified Stellar Network & Environment Configuration
 * Centralized config for Horizon, Soroban RPC, and Smart Contract ID.
 */

export const STELLAR_CONFIG = {
  network: import.meta.env.VITE_STELLAR_NETWORK || 'TESTNET',
  horizonUrl: import.meta.env.VITE_HORIZON_URL || 'https://horizon-testnet.stellar.org',
  sorobanRpcUrl: import.meta.env.VITE_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org',
  contractId: import.meta.env.VITE_CONTRACT_ID || 'CBBRIDGE5Z7VQK4Z9X32P8QW6N1M8Y0T3U5V7W9X1Y2Z3A4B5C6D7E8F9',
  networkPassphrase: Networks.TESTNET,
};

export default STELLAR_CONFIG;
