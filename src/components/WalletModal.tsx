import { useState } from 'react';
import { X, Wallet, CheckCircle, RefreshCw, ExternalLink, ShieldCheck, Key } from 'lucide-react';
import { useCredBridge } from '../context/CredBridgeContext';
import { fundTestnetAccount, fetchAccountBalance } from '../services/stellar';

export function WalletModal() {
  const { isWalletModalOpen, setIsWalletModalOpen, wallet, connectWallet, addToast } = useCredBridge();
  const [isFunding, setIsFunding] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  if (!isWalletModalOpen) return null;

  const handleFundAccount = async () => {
    if (!wallet.publicKey) return;
    setIsFunding(true);
    try {
      const success = await fundTestnetAccount(wallet.publicKey);
      if (success) {
        addToast('success', 'Requested 10,000 Testnet XLM from Friendbot!');
        await fetchAccountBalance(wallet.publicKey);
      } else {
        addToast('error', 'Friendbot funding failed.');
      }
    } catch {
      addToast('error', 'Error contacting Friendbot faucet.');
    } finally {
      setIsFunding(false);
    }
  };

  const handleConnect = async (forceDemo = false) => {
    setIsConnecting(true);
    try {
      await connectWallet(forceDemo);
    } finally {
      setIsConnecting(false);
    }
  };

  const truncatedKey = wallet.publicKey 
    ? `${wallet.publicKey.substring(0, 6)}...${wallet.publicKey.substring(wallet.publicKey.length - 6)}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md anim-fade font-inter">
      <div className="w-full max-w-md bg-neutral-950 border border-white/15 rounded-2xl p-6 shadow-2xl relative text-white">
        
        {/* Close Button */}
        <button 
          onClick={() => setIsWalletModalOpen(false)}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Stellar Testnet Wallet</h2>
            <p className="text-xs text-white/60">CredBridge Web3 Identity Connection</p>
          </div>
        </div>

        {wallet.isConnected && wallet.publicKey ? (
          <div className="space-y-4">
            {/* Status Badge */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Network</span>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {wallet.network}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Public Key</span>
                <span className="font-mono text-xs font-medium text-white">{truncatedKey}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Testnet XLM Balance</span>
                <span className="text-sm font-bold text-white">{wallet.balance} XLM</span>
              </div>
            </div>

            {/* Friendbot Faucet CTA */}
            <div className="pt-2">
              <button
                onClick={handleFundAccount}
                disabled={isFunding}
                className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-medium text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isFunding ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Funding via Friendbot...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    Request 10,000 Testnet XLM (Friendbot)
                  </>
                )}
              </button>
            </div>

            {/* Explorer Link */}
            <a
              href={`https://stellar.expert/explorer/testnet/account/${wallet.publicKey}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-white/60 hover:text-white flex items-center justify-center gap-1 mt-2 transition-colors"
            >
              <span>View Account on Stellar Expert Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <div className="pt-4 border-t border-white/10 flex gap-2">
              <button
                onClick={() => handleConnect(false)}
                disabled={isConnecting}
                className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-xs font-medium rounded-lg text-white transition-colors"
              >
                Reconnect Freighter
              </button>
              <button
                onClick={() => handleConnect(true)}
                disabled={isConnecting}
                className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-xs font-medium rounded-lg text-white transition-colors"
              >
                Use Passkey Mode
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-white/70 leading-relaxed">
              Connect your Freighter extension wallet to issue and verify privacy-preserving reputation proofs on Stellar Testnet.
            </p>

            <button
              onClick={() => handleConnect(false)}
              disabled={isConnecting}
              className="w-full py-3 bg-white text-black font-medium text-sm rounded-lg hover:bg-white/90 transition-colors flex items-center justify-center gap-2 btn-cut"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  Connecting to Freighter...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-black" />
                  Connect Freighter Wallet
                </>
              )}
            </button>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <span className="relative bg-neutral-950 px-3 text-[11px] text-white/50">OR FOR UNDERBANKED USERS</span>
            </div>

            <button
              onClick={() => handleConnect(true)}
              disabled={isConnecting}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-medium text-sm rounded-lg transition-colors border border-white/20 flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4 text-white/80" />
              Use Instant Passkey Demo Account
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
