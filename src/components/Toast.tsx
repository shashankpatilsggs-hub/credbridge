import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useCredBridge } from '../context/CredBridgeContext';

export function ToastContainer() {
  const { toasts, removeToast } = useCredBridge();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full font-inter">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`p-4 rounded-xl border backdrop-blur-md shadow-2xl flex items-start justify-between gap-3 text-xs text-white transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/40'
              : toast.type === 'error'
              ? 'bg-rose-950/80 border-rose-500/40'
              : 'bg-neutral-900/90 border-white/20'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />}
            <span className="leading-relaxed">{toast.text}</span>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
