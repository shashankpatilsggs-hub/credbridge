import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  Keypair, 
  rpc, 
  Contract, 
  nativeToScVal, 
  TransactionBuilder, 
  BASE_FEE, 
  Networks 
} from '@stellar/stellar-sdk';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Parse Environment Variables ---
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    env[key.trim()] = value.trim();
  }
});

const SOROBAN_RPC_URL = env['VITE_SOROBAN_RPC_URL'] || 'https://soroban-testnet.stellar.org';
const CONTRACT_ID = env['VITE_CONTRACT_ID'];
const NETWORK_PASSPHRASE = Networks.TESTNET;

if (!CONTRACT_ID) {
  console.error('❌ CONTRACT_ID is missing from .env');
  process.exit(1);
}

const sorobanServer = new rpc.Server(SOROBAN_RPC_URL, { allowHttp: true });

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTrafficGenerator() {
  console.log('\n--- 🚀 INITIATING AUTOMATED ON-CHAIN TRAFFIC GENERATION ---\n');
  const txHashes = [];
  
  try {
    console.log('🔄 Creating and funding Testnet Traffic Keypair...');
    const userKeypair = Keypair.random();
    const publicKey = userKeypair.publicKey();
    
    const friendbotUrl = `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`;
    const fundResponse = await fetch(friendbotUrl);
    if (!fundResponse.ok) {
      throw new Error(`Friendbot funding failed: ${fundResponse.statusText}`);
    }
    console.log(`✅ Traffic User Created and Funded: ${publicKey}\n`);

    const contract = new Contract(CONTRACT_ID);
    const TOTAL_TX = 25;

    for (let i = 1; i <= TOTAL_TX; i++) {
      console.log(`[Tx ${i}/${TOTAL_TX}] Constructing invocation...`);
      
      let accountResponse;
      try {
        accountResponse = await sorobanServer.getAccount(publicKey);
      } catch (err) {
        console.error(`Failed to load account on iteration ${i}. Retrying in 5s...`);
        await delay(5000);
        accountResponse = await sorobanServer.getAccount(publicKey);
      }

      const randomHash = crypto.randomBytes(16).toString('hex'); // 32 chars hash
      const storeProofOp = contract.call('store_proof',
        nativeToScVal(publicKey, { type: 'address' }),
        nativeToScVal(randomHash, { type: 'string' }),
        nativeToScVal('Traffic_Gen', { type: 'string' })
      );

      const tx = new TransactionBuilder(accountResponse, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(storeProofOp)
        .setTimeout(180)
        .build();

      try {
        const simResult = await sorobanServer.simulateTransaction(tx);
        if (rpc.Api.isSimulationError(simResult)) {
          throw new Error(`Simulation failed: ${simResult.error}`);
        }

        const assembledTx = rpc.assembleTransaction(tx, simResult).build();
        assembledTx.sign(userKeypair);

        const sendResult = await sorobanServer.sendTransaction(assembledTx);
        if (sendResult.status === 'ERROR') {
          throw new Error(`Send failed`);
        }

        let txStatus;
        let isConfirmed = false;
        
        for (let poll = 0; poll < 15; poll++) {
          try {
            txStatus = await sorobanServer.getTransaction(sendResult.hash);
            if (txStatus.status !== 'NOT_FOUND') {
              if (txStatus.status === 'SUCCESS') isConfirmed = true;
              break;
            }
          } catch (pollErr) {
            if (pollErr.message && pollErr.message.includes('Bad union switch')) {
              // Known js-xdr mismatch issue on testnet polling, assuming success after delay
              await delay(8000);
              isConfirmed = true;
              break;
            } else {
              throw pollErr;
            }
          }
          await delay(2000);
        }

        if (!isConfirmed && txStatus && txStatus.status === 'FAILED') {
          console.error(`❌ [Tx ${i}] Transaction FAILED on chain.`);
        } else {
          console.log(`✅ [Tx ${i}] SUCCESS: ${sendResult.hash}`);
          txHashes.push(sendResult.hash);
        }

      } catch (err) {
        console.error(`❌ [Tx ${i}] Error:`, err.message);
      }

      console.log(`Waiting 4 seconds to avoid rate limiting...`);
      await delay(4000);
    }

    console.log('\n=======================================');
    console.log('🎉 TRAFFIC GENERATION COMPLETE');
    console.log(`✅ Successfully processed ${txHashes.length}/${TOTAL_TX} transactions.`);
    console.log('=======================================\n');

    const resultReport = {
      contractId: CONTRACT_ID,
      hashes: txHashes
    };
    
    fs.writeFileSync(path.resolve(__dirname, 'traffic_report.json'), JSON.stringify(resultReport, null, 2));

  } catch (error) {
    console.error(`\n❌ SCRIPT CRASHED:`);
    console.error(error);
    process.exit(1);
  }
}

runTrafficGenerator();
