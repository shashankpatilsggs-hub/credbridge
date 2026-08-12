import { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Lock, CheckCircle2, ExternalLink, RefreshCw, Sparkles, Award, Search } from 'lucide-react';
import { useCredBridge } from '../context/CredBridgeContext';
import { computeSHA256 } from '../services/stellar';

export function DashboardView() {
  const { setCurrentView, wallet, submitProof, proofs, setIsWalletModalOpen } = useCredBridge();

  const [credentialType, setCredentialType] = useState('gig_work');
  const [providerName, setProviderName] = useState('Upwork / Freelance Hub');
  const [ratingScore, setRatingScore] = useState('4.92');
  const [completedJobs, setCompletedJobs] = useState('154');
  const [rawJSON, setRawJSON] = useState('');
  const [liveHash, setLiveHash] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  // Update raw JSON payload & calculate hash in real-time
  useEffect(() => {
    const payload = JSON.stringify({
      protocol: 'CredBridge-v1',
      credential_type: credentialType,
      provider: providerName,
      metrics: {
        score: parseFloat(ratingScore) || 0,
        volume: parseInt(completedJobs, 10) || 0,
      },
      issued_at: new Date().toISOString().split('T')[0],
    }, null, 2);

    setRawJSON(payload);

    computeSHA256(payload).then(hash => {
      setLiveHash(hash);
    });
  }, [credentialType, providerName, ratingScore, completedJobs]);

  const handleSubmitProof = async () => {
    setTxError(null);
    setIsSubmitting(true);

    try {
      await submitProof(rawJSON);
    } catch (err: any) {
      setTxError(err.message || 'Transaction submission failed on Stellar Testnet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const truncatedKey = wallet.publicKey 
    ? `${wallet.publicKey.substring(0, 6)}...${wallet.publicKey.substring(wallet.publicKey.length - 4)}`
    : 'Not Connected';

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto relative z-10 p-6 md:p-10 text-white font-inter">
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <button
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors btn-cut text-xs font-medium text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('verifier')}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xs font-medium transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Verifier Tool</span>
          </button>

          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xs font-mono transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{truncatedKey}</span>
            {wallet.balance && <span className="text-white/60">({wallet.balance} XLM)</span>}
          </button>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        
        {/* Left Column: Proof Generator */}
        <div className="lg:col-span-7 bg-black/60 backdrop-blur-xl border border-white/15 rounded-2xl p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-white" />
              <h2 className="text-xl font-medium tracking-tight">Privacy-Preserving Proof Generator</h2>
            </div>
            <p className="text-xs text-white/70 leading-relaxed mb-6">
              Generate zero-knowledge reputation hashes client-side. Raw financial & work data stays private; only the cryptographic proof is anchored to Stellar Testnet.
            </p>

            {/* Credential Selector */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">Credential Category</label>
                <select
                  value={credentialType}
                  onChange={e => setCredentialType(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-white"
                >
                  <option value="gig_work" className="bg-black text-white">Gig Work & Freelance Reputation</option>
                  <option value="micro_loan" className="bg-black text-white">Micro-Loan Repayment History</option>
                  <option value="peer_trust" className="bg-black text-white">Peer-to-Peer Trust Attestation</option>
                  <option value="kyc_verification" className="bg-black text-white">Zero-Knowledge Identity Verification</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Platform / Issuer</label>
                  <input
                    type="text"
                    value={providerName}
                    onChange={e => setProviderName(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Reputation Score</label>
                  <input
                    type="text"
                    value={ratingScore}
                    onChange={e => setRatingScore(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Completed Jobs</label>
                  <input
                    type="text"
                    value={completedJobs}
                    onChange={e => setCompletedJobs(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              {/* SHA-256 Hash Display */}
              <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    Client-Side SHA-256 Digest
                  </span>
                  <span className="text-[10px] text-emerald-400">Zero-Knowledge</span>
                </div>
                <div className="font-mono text-xs text-white bg-black/50 p-2.5 rounded border border-white/10 break-all select-all">
                  {liveHash || 'Computing SHA-256...'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-8 pt-4 border-t border-white/10">
            {txError && (
              <p className="text-xs text-rose-400 mb-3 text-center bg-rose-950/40 p-2.5 rounded-lg border border-rose-500/20">
                {txError}
              </p>
            )}

            <button
              onClick={handleSubmitProof}
              disabled={isSubmitting}
              className="w-full py-4 bg-white text-black font-medium text-sm hover:bg-white/90 transition-colors btn-cut flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>Signing & Anchoring to Stellar Testnet...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black group-hover:scale-110 transition-transform" />
                  <span>Submit Proof to Stellar Testnet</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Verified Reputation Passport & Activity */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Passport Metrics Card */}
          <div className="bg-black/60 backdrop-blur-xl border border-white/15 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs tracking-widest text-white/60 uppercase">CREDENTIAL PASSPORT</span>
              <Award className="w-5 h-5 text-white/80" />
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-3xl font-bold tracking-tight">895 / 900</span>
                <p className="text-xs text-emerald-400 mt-0.5">Top 1% Global Portable Reputation</p>
              </div>

              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full w-[95%]"></div>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2 text-xs text-white/70">
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-white/50 block text-[10px]">VERIFIED PROOFS</span>
                  <span className="font-semibold text-white text-sm">{proofs.length + 3} On-Chain</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-white/50 block text-[10px]">NETWORK</span>
                  <span className="font-semibold text-white text-sm">Stellar Testnet</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent On-Chain Proofs Activity */}
          <div className="bg-black/60 backdrop-blur-xl border border-white/15 rounded-2xl p-6 flex-1 flex flex-col">
            <h3 className="text-sm font-medium tracking-tight mb-4 flex items-center justify-between">
              <span>On-Chain Stellar Proofs</span>
              <span className="text-xs text-white/50">{proofs.length} Recorded</span>
            </h3>

            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
              {proofs.length === 0 ? (
                <div className="text-center py-8 text-xs text-white/40 border border-dashed border-white/10 rounded-xl">
                  No transaction proofs submitted in this session.<br />Click "Submit Proof" to anchor your first credential.
                </div>
              ) : (
                proofs.map((proof, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Stellar Proof Confirmed
                      </span>
                      <span className="text-[10px] text-white/40">{new Date(proof.timestamp).toLocaleTimeString()}</span>
                    </div>

                    <div className="font-mono text-[11px] text-white/80 truncate">
                      Hash: {proof.hash.substring(0, 24)}...
                    </div>

                    <a
                      href={proof.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-white hover:underline pt-1"
                    >
                      <span>View Tx on Stellar Expert</span>
                      <ExternalLink className="w-3 h-3 text-white/70" />
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
