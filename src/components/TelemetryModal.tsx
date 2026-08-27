import { useState, useEffect } from 'react';
import { X, Activity, AlertCircle, CheckCircle2, RefreshCw, BarChart2 } from 'lucide-react';
import { analytics, AnalyticsEvent, TrackedError } from '../services/analytics';
import STELLAR_CONFIG from '../config/stellar';

interface TelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TelemetryModal({ isOpen, onClose }: TelemetryModalProps) {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [errors, setErrors] = useState<TrackedError[]>([]);
  const [horizonStatus, setHorizonStatus] = useState<'healthy' | 'checking' | 'error'>('checking');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Load events and errors from analytics service
    setEvents(analytics.getEvents());
    setErrors(analytics.getErrors());

    // Check Horizon Testnet latency
    const start = Date.now();
    fetch(`${STELLAR_CONFIG.horizonUrl}/fee_stats`)
      .then(res => {
        if (res.ok) {
          setLatencyMs(Date.now() - start);
          setHorizonStatus('healthy');
        } else {
          setHorizonStatus('error');
        }
      })
      .catch(() => setHorizonStatus('error'));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md anim-fade font-inter text-white">
      <div className="w-full max-w-2xl bg-neutral-950 border border-white/20 rounded-2xl p-6 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">System Observability & Telemetry</h2>
            <p className="text-xs text-white/60">Real-Time Vercel Analytics & Sentry Error Tracking Logs</p>
          </div>
        </div>

        {/* Network Health Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-xs">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-white/50 text-[10px]">STELLAR TESTNET HORIZON</span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                {horizonStatus === 'healthy' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {horizonStatus === 'checking' && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {horizonStatus === 'healthy' ? 'Operational' : 'Checking...'}
              </span>
              {latencyMs && <span className="font-mono text-white/60 text-[11px]">{latencyMs}ms</span>}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-white/50 text-[10px]">SOROBAN CONTRACT</span>
            <span className="font-mono text-white text-[11px] truncate block">{STELLAR_CONFIG.contractId.substring(0, 14)}...</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-white/50 text-[10px]">CAPTURED EVENTS</span>
            <span className="font-semibold text-white text-sm">{events.length} Telemetry Events</span>
          </div>
        </div>

        {/* Telemetry Tabs */}
        <div className="space-y-4 text-xs">
          <div>
            <h3 className="font-medium text-white/80 mb-2 flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Event Stream (Vercel Analytics Standard)</span>
            </h3>

            <div className="bg-black/80 border border-white/10 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2 font-mono text-[11px]">
              {events.length === 0 ? (
                <div className="text-white/40 text-center py-4">No events captured yet in this session.</div>
              ) : (
                events.map((evt, idx) => (
                  <div key={idx} className="p-2 rounded bg-white/5 flex items-center justify-between">
                    <span className="text-emerald-300 font-semibold">{evt.name}</span>
                    <span className="text-white/40 text-[10px]">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sentry Errors Stream */}
          <div>
            <h3 className="font-medium text-white/80 mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>Sentry Error Monitor Exception Buffer</span>
            </h3>

            <div className="bg-black/80 border border-white/10 rounded-xl p-3 max-h-32 overflow-y-auto space-y-2 font-mono text-[11px]">
              {errors.length === 0 ? (
                <div className="text-emerald-400/80 text-center py-3">0 Uncaught Exceptions (Clean Execution)</div>
              ) : (
                errors.map((err, idx) => (
                  <div key={idx} className="p-2 rounded bg-rose-950/40 border border-rose-500/20 text-rose-300">
                    <div>{err.message}</div>
                    <div className="text-[10px] text-rose-400/60 mt-0.5">{new Date(err.timestamp).toLocaleTimeString()}</div>
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
