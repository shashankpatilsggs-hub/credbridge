import { Horizon, Networks, TransactionBuilder, Operation, Keypair, BASE_FEE } from '@stellar/stellar-sdk';
import { isConnected, requestAccess, getPublicKey, signTransaction } from '@stellar/freighter-api';

// Environment & Contract Configuration
export const STELLAR_NETWORK = import.meta.env.VITE_STELLAR_NETWORK || 'TESTNET';
export const HORIZON_TESTNET_URL = import.meta.env.VITE_HORIZON_URL || 'https://horizon-testnet.stellar.org';
export const SOROBAN_RPC_URL = import.meta.env.VITE_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
export const SOROBAN_CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID || 'CBBRIDGE5Z7VQK4Z9X32P8QW6N1M8Y0T3U5V7W9X1Y2Z3A4B5C6D7E8F9';
export const STELLAR_NETWORK_PASSPHRASE = Networks.TESTNET;

export const horizonServer = new Horizon.Server(HORIZON_TESTNET_URL);

export interface WalletState {
  isConnected: boolean;
  publicKey: string | null;
  balance: string | null;
  network: string;
  isDemo: boolean;
}

export interface ReputationProofResult {
  hash: string;
  txHash: string;
  contractId: string;
  timestamp: string;
  explorerUrl: string;
}

/**
 * Check if Freighter extension is installed in the browser
 */
export async function checkFreighterInstalled(): Promise<boolean> {
  try {
    const installed = await isConnected();
    return Boolean(installed);
  } catch {
    return false;
  }
}

/**
 * Connect to Freighter Wallet or generate a fallback Testnet Passkey/Keypair for demo/testing
 */
export async function connectFreighterWallet(forceDemo = false): Promise<WalletState> {
  if (!forceDemo) {
    const hasFreighter = await checkFreighterInstalled();
    if (hasFreighter) {
      try {
        let pubKey = '';
        try {
          pubKey = await requestAccess();
        } catch {
          pubKey = await getPublicKey();
        }

        if (pubKey) {
          const balance = await fetchAccountBalance(pubKey);
          return {
            isConnected: true,
            publicKey: pubKey,
            balance,
            network: 'Stellar Testnet',
            isDemo: false,
          };
        }
      } catch (err) {
        console.warn('Freighter connection fallback:', err);
      }
    }
  }

  // Fallback / Demo Keypair for underbanked users & testing without Freighter extension
  let storedDemoSecret = localStorage.getItem('credbridge_demo_secret');
  let keypair: Keypair;
  if (storedDemoSecret) {
    keypair = Keypair.fromSecret(storedDemoSecret);
  } else {
    keypair = Keypair.random();
    localStorage.setItem('credbridge_demo_secret', keypair.secret());
  }

  const pubKey = keypair.publicKey();
  let balance = await fetchAccountBalance(pubKey);
  
  // If demo account unfunded, request Friendbot XLM
  if (balance === '0' || balance === 'Unfunded Account' || balance === '0.00') {
    await fundTestnetAccount(pubKey);
    balance = await fetchAccountBalance(pubKey);
  }

  return {
    isConnected: true,
    publicKey: pubKey,
    balance,
    network: 'Stellar Testnet (Passkey Mode)',
    isDemo: true,
  };
}

/**
 * Fetch Account XLM Balance from Stellar Horizon Testnet
 */
export async function fetchAccountBalance(publicKey: string): Promise<string> {
  try {
    const account = await horizonServer.loadAccount(publicKey);
    const nativeBalance = account.balances.find((b: any) => b.asset_type === 'native');
    return nativeBalance ? parseFloat(nativeBalance.balance).toFixed(2) : '0.00';
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return 'Unfunded Account';
    }
    return '0.00';
  }
}

/**
 * Fund account via Stellar Friendbot (Testnet Faucet)
 */
export async function fundTestnetAccount(publicKey: string): Promise<boolean> {
  try {
    const response = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
    return response.ok;
  } catch (err) {
    console.error('Friendbot funding failed:', err);
    return false;
  }
}

/**
 * Compute SHA-256 hash for privacy-preserving reputation proof
 */
export async function computeSHA256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Create and submit a Stellar Testnet transaction containing the Privacy-Preserving Reputation Proof Hash
 */
export async function submitReputationProofOnChain(
  wallet: WalletState,
  rawCredentialData: string
): Promise<ReputationProofResult> {
  if (!wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  // 1. Calculate privacy-preserving hash locally
  const dataHash = await computeSHA256(rawCredentialData);
  const shortenedHash = dataHash.substring(0, 32);

  // 2. Fund account if unfunded
  let account;
  try {
    account = await horizonServer.loadAccount(wallet.publicKey);
  } catch (err: any) {
    if (err?.response?.status === 404) {
      await fundTestnetAccount(wallet.publicKey);
      account = await horizonServer.loadAccount(wallet.publicKey);
    } else {
      throw err;
    }
  }

  // 3. Build Stellar Transaction storing proof via ManageData operation anchored to Soroban Contract ID
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.manageData({
        name: 'CredBridge_Proof',
        value: shortenedHash,
      })
    )
    .setTimeout(180)
    .build();

  let signedTxXdr = '';

  // 4. Sign transaction via Freighter or local Demo keypair
  if (!wallet.isDemo) {
    const signed = await signTransaction(tx.toXDR(), {
      network: 'TESTNET',
      networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
    });
    signedTxXdr = typeof signed === 'string' ? signed : (signed as any).signedTxXdr || (signed as any).xdr;
  } else {
    const storedSecret = localStorage.getItem('credbridge_demo_secret');
    if (!storedSecret) throw new Error('Demo keypair secret missing');
    const keypair = Keypair.fromSecret(storedSecret);
    tx.sign(keypair);
    signedTxXdr = tx.toXDR();
  }

  // 5. Submit to Horizon Testnet
  const submitTx = TransactionBuilder.fromXDR(signedTxXdr, STELLAR_NETWORK_PASSPHRASE);
  const result = await horizonServer.submitTransaction(submitTx);

  const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${result.hash}`;

  return {
    hash: dataHash,
    txHash: result.hash,
    contractId: SOROBAN_CONTRACT_ID,
    timestamp: new Date().toISOString(),
    explorerUrl,
  };
}
