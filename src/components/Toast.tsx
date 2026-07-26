// Notificação flutuante (toast).

export type ToastType = 'success' | 'error' | 'info';

export interface ToastState {
  show: boolean;
  message: string;
  type: ToastType;
}

export default function Toast({ toast }: { toast: ToastState }) {
  if (!toast.show) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-24 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-xl shadow-2xl border text-xs font-bold flex items-center space-x-2 animate-[fadeIn_0.2s_ease-out] ${
        toast.type === 'error'
          ? 'bg-red-950/95 border-red-500/40 text-red-200'
          : toast.type === 'info'
          ? 'bg-slate-800/95 border-slate-600/50 text-slate-100'
          : 'bg-emerald-950/95 border-emerald-500/40 text-emerald-200'
      }`}
    >
      <span>{toast.type === 'error' ? '⚠️' : toast.type === 'info' ? 'ℹ️' : '✓'}</span>
      <span>{toast.message}</span>
    </div>
  );
}
