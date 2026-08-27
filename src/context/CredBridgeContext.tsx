import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WalletState, connectFreighterWallet, fetchAccountBalance, submitReputationProofOnChain, ReputationProofResult } from '../services/stellar';
import { analytics, AnalyticsEvent } from '../services/analytics';
import { submitUserFeedback, FeedbackSubmission, getStoredFeedback } from '../services/feedback';
import { syncProofToBackend } from '../services/api';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface CredBridgeContextType {
  // Navigation
  currentView: 'landing' | 'dashboard' | 'verifier';
  setCurrentView: (view: 'landing' | 'dashboard' | 'verifier') => void;

  // Wallet
  wallet: WalletState;
  connectWallet: (forceDemo?: boolean) => Promise<void>;
  refreshBalance: () => Promise<void>;

  // Modals
  isWalletModalOpen: boolean;
  setIsWalletModalOpen: (open: boolean) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  isFeedbackOpen: boolean;
  setIsFeedbackOpen: (open: boolean) => void;

  // Proofs & Reputation
  proofs: ReputationProofResult[];
  addProof: (proof: ReputationProofResult) => void;
  submitProof: (credentialData: string) => Promise<ReputationProofResult>;

  // Feedback & Analytics
  feedbackList: FeedbackSubmission[];
  postFeedback: (rating: number, category: any, comments: string) => Promise<void>;
  analyticsEvents: AnalyticsEvent[];

  // Toasts
  toasts: Toast[];
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
  removeToast: (id: string) => void;
}

const CredBridgeContext = createContext<CredBridgeContextType | undefined>(undefined);

export const CredBridgeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'verifier'>('landing');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    publicKey: null,
    balance: null,
    network: 'Stellar Testnet',
    isDemo: false,
  });

  const [proofs, setProofs] = useState<ReputationProofResult[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('credbridge_proofs') || '[]');
    } catch {
      return [];
    }
  });

  const [feedbackList, setFeedbackList] = useState<FeedbackSubmission[]>(getStoredFeedback());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [analyticsEvents] = useState<AnalyticsEvent[]>([]);

  // Initial load
  useEffect(() => {
    analytics.trackEvent('app_initialized', { view: currentView });

    const hasOnboarded = localStorage.getItem('credbridge_onboarded');
    if (!hasOnboarded) {
      setIsOnboardingOpen(true);
    }

    const savedWalletType = localStorage.getItem('credbridge_wallet_type');
    const savedSecret = localStorage.getItem('credbridge_demo_secret');
    
    if (savedWalletType === 'freighter') {
      connectFreighterWallet(false).then(w => {
        if (w.isConnected) {
          setWallet(w);
          analytics.trackEvent('auto_reconnect_freighter', { pubKey: w.publicKey });
        }
      }).catch(err => {
        analytics.captureException(err, { context: 'auto_connect_freighter' });
      });
    } else if (savedSecret) {
      connectFreighterWallet(true).then(w => {
        setWallet(w);
        analytics.trackEvent('auto_reconnect_passkey', { pubKey: w.publicKey });
      }).catch(err => {
        analytics.captureException(err, { context: 'auto_connect' });
      });
    }
  }, []);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const connectWallet = async (forceDemo = false) => {
    try {
      const w = await connectFreighterWallet(forceDemo);
      setWallet(w);
      localStorage.setItem('credbridge_wallet_type', w.isDemo ? 'passkey' : 'freighter');
      analytics.trackEvent('wallet_connected', { pubKey: w.publicKey, isDemo: w.isDemo });
      addToast('success', `Connected: ${w.publicKey?.substring(0, 6)}... (${w.network})`);
    } catch (err: any) {
      analytics.captureException(err, { context: 'connectWallet' });
      addToast('error', 'Wallet connection failed. Using Passkey mode.');
      const fallback = await connectFreighterWallet(true);
      setWallet(fallback);
      localStorage.setItem('credbridge_wallet_type', 'passkey');
    }
  };

  const refreshBalance = async () => {
    if (!wallet.publicKey) return;
    try {
      const balance = await fetchAccountBalance(wallet.publicKey);
      setWallet(prev => ({ ...prev, balance }));
    } catch (err) {
      console.error('Balance refresh error:', err);
    }
  };

  const addProof = (proof: ReputationProofResult) => {
    setProofs(prev => {
      const updated = [proof, ...prev];
      localStorage.setItem('credbridge_proofs', JSON.stringify(updated.slice(0, 50)));
      return updated;
    });
  };

  const submitProof = async (credentialData: string): Promise<ReputationProofResult> => {
    let activeWallet = wallet;
    if (!activeWallet.isConnected || !activeWallet.publicKey) {
      activeWallet = await connectFreighterWallet(true);
      setWallet(activeWallet);
    }

    try {
      const result = await submitReputationProofOnChain(activeWallet, credentialData);
      addProof(result);
      await refreshBalance();
      
      // Phase 4: Sync to Backend/DB
      if (activeWallet.publicKey) {
        await syncProofToBackend(result, activeWallet.publicKey);
      }
      
      addToast('success', `Proof anchored to Stellar Testnet! Tx: ${result.txHash.substring(0, 8)}...`);
      analytics.trackEvent('reputation_proof_submitted', { txHash: result.hash });
      return result;
    } catch (err: any) {
      analytics.captureException(err, { context: 'submitProof' });
      addToast('error', err.message || 'Failed to submit proof on Stellar Testnet.');
      throw err;
    }
  };

  const postFeedback = async (rating: number, category: any, comments: string) => {
    try {
      const res = await submitUserFeedback({
        rating,
        category,
        comments,
        userPublicKey: wallet.publicKey || undefined,
      });
      setFeedbackList(prev => [...prev, res]);
      addToast('success', 'Off-chain feedback saved successfully!');
      analytics.trackEvent('feedback_submitted', { rating, category });
    } catch (err: any) {
      addToast('error', 'Failed to save feedback.');
      throw err;
    }
  };

  return (
    <CredBridgeContext.Provider
      value={{
        currentView,
        setCurrentView,
        wallet,
        connectWallet,
        refreshBalance,
        isWalletModalOpen,
        setIsWalletModalOpen,
        isOnboardingOpen,
        setIsOnboardingOpen,
        isFeedbackOpen,
        setIsFeedbackOpen,
        proofs,
        addProof,
        submitProof,
        feedbackList,
        postFeedback,
        analyticsEvents,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </CredBridgeContext.Provider>
  );
};

export const useCredBridge = () => {
  const context = useContext(CredBridgeContext);
  if (!context) {
    throw new Error('useCredBridge must be used within a CredBridgeProvider');
  }
  return context;
};
