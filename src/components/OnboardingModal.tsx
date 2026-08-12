import { useState } from 'react';
import { X, ShieldCheck, Sparkles, CheckCircle2, RefreshCw, ArrowRight } from 'lucide-react';
import { useCredBridge } from '../context/CredBridgeContext';

export function OnboardingModal() {
  const { isOnboardingOpen, setIsOnboardingOpen, connectWallet, setCurrentView, addToast } = useCredBridge();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRole, setSelectedRole] = useState('freelancer');
  const [isInitializing, setIsInitializing] = useState(false);

  if (!isOnboardingOpen) return null;

  const handleNextStep = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setIsInitializing(true);
      try {
        await connectWallet(true);
        localStorage.setItem('credbridge_onboarded', 'true');
        addToast('success', 'Onboarding Complete! Passkey Account Ready.');
        setIsOnboardingOpen(false);
        setCurrentView('dashboard');
      } catch (err) {
        console.error(err);
      } finally {
        setIsInitializing(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md anim-fade font-inter">
      <div className="w-full max-w-lg bg-neutral-950 border border-white/20 rounded-2xl p-6 md:p-8 shadow-2xl relative text-white">
        
        {/* Close Button */}
        <button
          onClick={() => setIsOnboardingOpen(false)}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-white' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs tracking-widest text-emerald-400 uppercase font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Step 1 of 3: User Profile</span>
            </div>
            <h2 className="text-xl font-medium tracking-tight">Welcome to CredBridge</h2>
            <p className="text-xs text-white/70 leading-relaxed">
              Reshaping reputation with privacy-preserving Stellar technologies. Select your primary use case to begin:
            </p>

            <div className="space-y-2.5 pt-2">
              {[
                { id: 'freelancer', title: 'Gig Worker & Freelancer', desc: 'Port reputation across platforms like Upwork, Fiverr, and Uber.' },
                { id: 'microfinance', title: 'Micro-Finance & Credit Borrower', desc: 'Build zero-knowledge credit proofs for underbanked loans.' },
                { id: 'verifier', title: 'Credential Verifier / Institution', desc: 'Verify cryptographic proofs without exposing user data.' },
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    selectedRole === role.id
                      ? 'bg-white/15 border-white text-white'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <div className="font-medium text-sm text-white flex items-center justify-between">
                    <span>{role.title}</span>
                    {selectedRole === role.id && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-xs text-white/50 mt-1">{role.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Zero-Knowledge Privacy Architecture */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs tracking-widest text-emerald-400 uppercase font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Step 2 of 3: Zero-Knowledge Guarantee</span>
            </div>
            <h2 className="text-xl font-medium tracking-tight">Your Data Never Leaves Your Device</h2>
            <p className="text-xs text-white/70 leading-relaxed">
              CredBridge computes SHA-256 cryptographic hashes client-side. Only the mathematical proof is anchored to the Stellar Testnet.
            </p>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">1</div>
                <div>
                  <span className="font-medium text-white">Local Hashing</span>
                  <p className="text-white/50 text-[11px]">Financial ratings hashed in browser using Web Crypto API.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">2</div>
                <div>
                  <span className="font-medium text-white">Stellar Testnet Anchor</span>
                  <p className="text-white/50 text-[11px]">ManageData operations record proof on Stellar Horizon.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">3</div>
                <div>
                  <span className="font-medium text-white">Universal Portability</span>
                  <p className="text-white/50 text-[11px]">Share your reputation anywhere with 100% privacy.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Instant Account Initialization */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs tracking-widest text-emerald-400 uppercase font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Step 3 of 3: Account Ready</span>
            </div>
            <h2 className="text-xl font-medium tracking-tight">1-Click Stellar Setup</h2>
            <p className="text-xs text-white/70 leading-relaxed">
              We'll automatically initialize your Stellar Passkey account and request 10,000 Testnet XLM from Friendbot so you can submit your first proof immediately.
            </p>

            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
              <span className="font-semibold block">Automatic Friendbot Faucet Pre-funding</span>
              <p className="text-emerald-400/80 text-[11px]">Zero setup friction for instant testing and onboarding.</p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-8 pt-4 border-t border-white/10 flex justify-between items-center">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => (s - 1) as any)}
              className="text-xs text-white/60 hover:text-white transition-colors"
            >
              Back
            </button>
          )}

          <button
            onClick={handleNextStep}
            disabled={isInitializing}
            className="ml-auto py-3 px-6 bg-white text-black font-medium text-xs hover:bg-white/90 transition-colors btn-cut flex items-center gap-2 disabled:opacity-50"
          >
            {isInitializing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Initializing Account...
              </>
            ) : (
              <>
                <span>{step === 3 ? 'Launch CredBridge App' : 'Continue'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
