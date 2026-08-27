import { useState } from 'react';
import { ArrowRight, HelpCircle, MessageSquare, Search, Wallet as WalletIcon, Menu, X } from 'lucide-react';
import { CredBridgeProvider, useCredBridge } from './context/CredBridgeContext';
import { WalletModal } from './components/WalletModal';
import { DashboardView } from './components/DashboardView';
import { VerifierView } from './components/VerifierView';
import { OnboardingModal } from './components/OnboardingModal';
import { FeedbackModal } from './components/FeedbackModal';
import { ToastContainer } from './components/Toast';

function MainAppContent() {
  const { 
    currentView, 
    setCurrentView, 
    wallet, 
    connectWallet, 
    setIsWalletModalOpen, 
    setIsOnboardingOpen, 
    setIsFeedbackOpen 
  } = useCredBridge();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const truncatedKey = wallet.publicKey 
    ? `${wallet.publicKey.substring(0, 4)}...${wallet.publicKey.substring(wallet.publicKey.length - 4)}`
    : 'Connect';

  return (
    <div className="h-screen w-full bg-black p-2 sm:p-3 md:p-4 font-inter select-none overflow-hidden">
      {/* Inner Screen Container */}
      <div className="w-full h-full rounded-2xl flex flex-col overflow-hidden relative bg-black border border-white/10">
        
        {/* Background Looping Video */}
        <video
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260717_120352_eb988725-1351-43b3-8095-16e4a1005e3d.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover anim-fade pointer-events-none"
          style={{ animationDelay: '0.2s' }}
        />

        {currentView === 'dashboard' ? (
          <DashboardView />
        ) : currentView === 'verifier' ? (
          <VerifierView />
        ) : (
          <>
            {/* Top Navbar */}
            <nav className="relative z-20 flex items-center justify-between px-4 sm:px-6 md:px-10 pt-4 sm:pt-6 md:pt-8">
              {/* Logo & Brand Block */}
              <div 
                className="anim-stagger flex flex-col items-center cursor-pointer"
                style={{ animationDelay: '0.1s' }}
                onClick={() => setCurrentView('landing')}
              >
                {/* Custom SVG Logo */}
                <svg 
                  viewBox="0 0 256 256" 
                  fill="white" 
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g transform="translate(128, 128)">
                    <path d="M 0,-104 A 104 104 0 0 1 104,0 L 24,0 A 24 24 0 0 0 0,-24 Z" opacity="1" />
                    <path d="M 104,0 A 104 104 0 0 1 0,104 L 0,24 A 24 24 0 0 0 24,0 Z" opacity="0.85" />
                    <path d="M 0,104 A 104 104 0 0 1 -104,0 L -24,0 A 24 24 0 0 0 0,24 Z" opacity="0.7" />
                    <path d="M -104,0 A 104 104 0 0 1 0,-104 L 0,-24 A 24 24 0 0 0 -24,0 Z" opacity="0.9" />
                  </g>
                </svg>
                <span className="text-white text-[9px] sm:text-[10px] md:text-xs tracking-[0.4em] mt-1 font-light">
                  C R E D
                </span>
              </div>

              {/* Desktop Navigation Buttons */}
              <div 
                className="anim-stagger hidden md:flex items-center gap-3"
                style={{ animationDelay: '0.2s' }}
              >
                <button 
                  onClick={() => setIsOnboardingOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-white/80 hover:text-white text-xs transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Guide</span>
                </button>

                <button 
                  onClick={() => setIsFeedbackOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-white/80 hover:text-white text-xs transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Feedback</span>
                </button>

                <button 
                  onClick={() => setCurrentView('verifier')}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 text-white text-sm hover:bg-white/10 transition-colors btn-cut-border"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Verifier</span>
                </button>

                <button 
                  onClick={() => {
                    if (!wallet.isConnected) connectWallet(false);
                    setIsWalletModalOpen(true);
                  }}
                  className="px-5 py-2.5 bg-white text-black text-sm hover:bg-white/90 transition-colors btn-cut"
                >
                  {wallet.isConnected ? (
                    <span className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {truncatedKey}
                    </span>
                  ) : (
                    'Connect Wallet'
                  )}
                </button>
              </div>

              {/* Mobile Right Action Bar */}
              <div className="flex md:hidden items-center gap-2">
                <button 
                  onClick={() => {
                    if (!wallet.isConnected) connectWallet(false);
                    setIsWalletModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-white text-black text-xs font-medium rounded btn-cut flex items-center gap-1"
                >
                  <WalletIcon className="w-3 h-3 text-black" />
                  <span>{truncatedKey}</span>
                </button>

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle Navigation Menu"
                  className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </button>
              </div>
            </nav>

            {/* Mobile Navigation Drawer Overlay */}
            {mobileMenuOpen && (
              <div className="md:hidden absolute top-20 right-4 z-30 w-56 bg-neutral-950/95 border border-white/20 rounded-2xl p-4 shadow-2xl backdrop-blur-xl space-y-3 text-white text-xs anim-fade">
                <button
                  onClick={() => { setCurrentView('verifier'); setMobileMenuOpen(false); }}
                  className="w-full text-left py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 flex items-center gap-2 transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-emerald-400" />
                  <span>On-Chain Verifier Tool</span>
                </button>

                <button
                  onClick={() => { setIsOnboardingOpen(true); setMobileMenuOpen(false); }}
                  className="w-full text-left py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 flex items-center gap-2 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                  <span>Onboarding Guide</span>
                </button>

                <button
                  onClick={() => { setIsFeedbackOpen(true); setMobileMenuOpen(false); }}
                  className="w-full text-left py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 flex items-center gap-2 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>User Feedback</span>
                </button>
              </div>
            )}

            {/* Main Content Area */}
            <div className="relative z-10 flex-1 flex flex-col justify-between px-4 sm:px-6 md:px-10 pb-6 sm:pb-8 md:pb-10">
              
              {/* Top Section */}
              <div className="flex-1 flex items-center relative">
                
                {/* Left Column (Desktop Only) */}
                <div 
                  className="anim-stagger hidden lg:flex flex-col gap-6 absolute left-0 top-[18%]"
                  style={{ animationDelay: '0.4s' }}
                >
                  <p className="text-white/80 text-base leading-relaxed max-w-[220px]">
                    Empowering the<br />underbanked<br />workforce
                  </p>
                  
                  {/* Decorative Group */}
                  <div className="flex flex-col gap-2 mt-4">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full border border-white/40"></div>
                      <div className="w-4 h-4 rounded-full border border-white/40"></div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-white/70 text-xs leading-tight">
                        Verified<br />Credentials
                      </span>
                      <span className="text-white/50 text-xs">01</span>
                    </div>
                  </div>
                </div>

                {/* Center Heading */}
                <div 
                  className="w-full text-center anim-stagger px-2 sm:px-0"
                  style={{ animationDelay: '0.5s' }}
                >
                  <h1 
                    className="text-white text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal leading-[1.1] tracking-[-0.04em]"
                    style={{ textShadow: '0 2px 12px rgba(0,0,0,0.25)' }}
                  >
                    Portable Trust<br />
                    Privacy-Preserving<br />
                    CredBridge Protocol
                  </h1>
                </div>

              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-center mt-4 sm:mt-8">
                
                {/* Column 1: Description */}
                <div 
                  className="anim-stagger flex items-center justify-center md:justify-end"
                  style={{ animationDelay: '0.7s' }}
                >
                  <p className="text-white/90 text-xs sm:text-sm leading-relaxed max-w-[280px] sm:max-w-[260px] text-center md:text-left md:ml-auto">
                    We push past financial conventions, reshaping reputation with privacy-preserving Stellar technologies.
                  </p>
                </div>

                {/* Column 2: App Title & Launch App CTA */}
                <div 
                  className="anim-stagger flex flex-col items-center gap-4 sm:gap-8 md:gap-24"
                  style={{ animationDelay: '0.85s' }}
                >
                  <span className="text-white text-xl sm:text-2xl md:text-3xl font-medium">
                    Reputation Dynamics
                  </span>
                  <button 
                    onClick={() => {
                      if (!wallet.isConnected) connectWallet(true);
                      setCurrentView('dashboard');
                    }}
                    className="w-full max-w-[260px] sm:max-w-[280px] py-3 sm:py-3.5 bg-white flex items-center justify-center gap-2 text-black hover:bg-white/90 transition-colors group btn-cut"
                  >
                    <span className="text-xs sm:text-sm font-medium">Launch App</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Column 3: Social Buttons */}
                <div 
                  className="anim-stagger flex items-center justify-center md:justify-end gap-3"
                  style={{ animationDelay: '1s' }}
                >
                  <a 
                    href="#x" 
                    aria-label="X (Twitter)"
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-white flex items-center justify-center text-black hover:bg-white/90 transition-colors btn-cut-sm"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>

                  <a 
                    href="#linkedin" 
                    aria-label="LinkedIn"
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-white flex items-center justify-center text-black hover:bg-white/90 transition-colors btn-cut-sm"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.66a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28"/>
                    </svg>
                  </a>

                  <a 
                    href="#facebook" 
                    aria-label="Facebook"
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-white flex items-center justify-center text-black hover:bg-white/90 transition-colors btn-cut-sm"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7.5v-3H10V9.69c0-2.47 1.47-3.83 3.72-3.83 1.08 0 2.2.19 2.2.19v2.42h-1.24c-1.23 0-1.61.76-1.61 1.54V12h2.73l-.44 3h-2.29v6.8c4.56-.93 8-4.96 8-9.8z"/>
                    </svg>
                  </a>
                </div>

              </div>

            </div>
          </>
        )}

        {/* Global Modals & Toasts */}
        <WalletModal />
        <OnboardingModal />
        <FeedbackModal />
        <ToastContainer />

      </div>
    </div>
  );
}

export default function App() {
  return (
    <CredBridgeProvider>
      <MainAppContent />
    </CredBridgeProvider>
  );
}
