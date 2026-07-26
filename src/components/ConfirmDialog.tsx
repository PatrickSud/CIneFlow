// Diálogo de confirmação reutilizável.
import type { ReactNode } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  icon?: string;
  title: string;
  confirmLabel: string;
  tone?: 'danger' | 'primary';
  onConfirm: () => void;
  onClose: () => void;
  children?: ReactNode;
}

export default function ConfirmDialog({
  open,
  icon,
  title,
  confirmLabel,
  tone = 'primary',
  onConfirm,
  onClose,
  children,
}: ConfirmDialogProps) {
  if (!open) return null;
  const confirmClass =
    tone === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700';
  const iconClass =
    tone === 'danger'
      ? 'bg-red-950/60 border-red-500/30'
      : 'bg-purple-950/60 border-purple-500/30';

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-slate-900 rounded-3xl border border-slate-800 max-w-sm w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {icon && (
          <div className={`w-12 h-12 border rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 ${iconClass}`}>
            {icon}
          </div>
        )}
        <h3 className="text-sm font-black text-white text-center mb-1">{title}</h3>
        <div className="text-xs text-slate-400 text-center mb-5">{children}</div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2 text-white text-xs font-bold uppercase tracking-wider rounded-xl ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
