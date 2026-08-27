import { Horizon, TransactionBuilder, Keypair, BASE_FEE, rpc, Contract, nativeToScVal } from '@stellar/stellar-sdk';
import { isConnected, requestAccess, getPublicKey, signTransaction } from '@stellar/freighter-api';
import STELLAR_CONFIG from '../config/stellar';

export const horizonServer = new Horizon.Server(STELLAR_CONFIG.horizonUrl);
export const sorobanServer = new rpc.Server(STELLAR_CONFIG.sorobanRpcUrl);

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
  ledger?: number;
  feePaid?: string;
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

  // 3. Build Soroban Contract Invocation Transaction
  const contract = new Contract(STELLAR_CONFIG.contractId);
  const storeProofOp = contract.call('store_proof',
    nativeToScVal(wallet.publicKey, { type: 'address' }),
    nativeToScVal(shortenedHash, { type: 'string' }),
    nativeToScVal('Credential', { type: 'string' })
  );

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: STELLAR_CONFIG.networkPassphrase,
  })
    .addOperation(storeProofOp)
    .setTimeout(180)
    .build();

  let signedTxXdr = '';

  // 4. Simulate Transaction (Soroban Requirement)
  try {
    const sim = await sorobanServer.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(sim)) {
      if (sim.error.includes('HostError') || sim.error.includes('auth')) {
        throw new Error('Contract logic rejected this action (Auth/HostError)');
      }
      throw new Error(`Simulation Failed: ${sim.error}`);
    }

    // 5. Assemble Transaction
    const assembledTx = rpc.assembleTransaction(tx, sim).build();

    // 6. Sign transaction via Freighter or local Demo keypair
    if (!wallet.isDemo) {
      const signed = await signTransaction(assembledTx.toXDR(), {
        network: STELLAR_CONFIG.network,
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      });
      signedTxXdr = typeof signed === 'string' ? signed : (signed as any).signedTxXdr || (signed as any).xdr;
    } else {
      const storedSecret = localStorage.getItem('credbridge_demo_secret');
      if (!storedSecret) throw new Error('Demo keypair secret missing');
      const keypair = Keypair.fromSecret(storedSecret);
      assembledTx.sign(keypair);
      signedTxXdr = assembledTx.toXDR();
    }
  } catch (err: any) {
    if (err.message.includes('Simulation')) throw err;
    throw new Error('Failed to assemble or sign transaction: ' + err.message);
  }

  // 7. Submit to Soroban RPC
  const submitTx = TransactionBuilder.fromXDR(signedTxXdr, STELLAR_CONFIG.networkPassphrase);
  const sendResult = await sorobanServer.sendTransaction(submitTx);
  if (sendResult.status === 'ERROR') {
    throw new Error('Transaction submission failed');
  }

  // 8. Poll for getTransactionStatus until SUCCESS or FAILED
  let txStatus;
  let attempts = 0;
  while (attempts < 20) {
    txStatus = await sorobanServer.getTransaction(sendResult.hash);
    if (txStatus.status !== 'NOT_FOUND') {
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
    attempts++;
  }

  if (!txStatus || txStatus.status === 'FAILED') {
    throw new Error('Transaction failed on-chain');
  }

  const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${sendResult.hash}`;

  return {
    hash: dataHash,
    txHash: sendResult.hash,
    contractId: STELLAR_CONFIG.contractId,
    ledger: txStatus.latestLedger,
    feePaid: '0.00001 XLM', // Standard minimum fee placeholder
    timestamp: new Date().toISOString(),
    explorerUrl,
  };
}
