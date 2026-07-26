// Modal para gerenciar membros de uma lista compartilhada.
import { useState } from 'react';
import type { SharedList } from '../types';

interface ManageMembersModalProps {
  open: boolean;
  list: SharedList | null;
  currentEmail: string;
  onClose: () => void;
  onSaveMembers: (emails: string[]) => void;
  onDeleteList: () => void;
  onLeaveList: () => void;
}

export default function ManageMembersModal({
  open,
  list,
  currentEmail,
  onClose,
  onSaveMembers,
  onDeleteList,
  onLeaveList,
}: ManageMembersModalProps) {
  const [novo, setNovo] = useState('');
  if (!open || !list) return null;

  const isOwner = list.ownerEmail.toLowerCase() === currentEmail.toLowerCase();

  const addEmail = () => {
    const e = novo.trim().toLowerCase();
    if (!e) return;
    if (list.memberEmails.some((m) => m.toLowerCase() === e)) { setNovo(''); return; }
    onSaveMembers([...list.memberEmails, e]);
    setNovo('');
  };
  const removeEmail = (email: string) => {
    onSaveMembers(list.memberEmails.filter((m) => m.toLowerCase() !== email.toLowerCase()));
  };

  return (
    <div className="fixed inset-0 z-[76] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-slate-900 rounded-3xl border border-slate-800 max-w-sm w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Fechar" className="absolute top-4 right-4 p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 rounded-lg border border-slate-800">✕</button>
        <h3 className="text-sm font-black uppercase tracking-wider text-white mb-1">👥 {list.nome}</h3>
        <p className="text-xs text-slate-400 mb-4">Membros com acesso a esta lista.</p>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 mb-4">
          {list.memberEmails.map((m) => (
            <div key={m} className="flex items-center justify-between bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2">
              <span className="text-xs text-slate-200 truncate">
                {m} {m.toLowerCase() === list.ownerEmail.toLowerCase() && <span className="text-[9px] text-purple-400 font-bold">(dono)</span>}
              </span>
              {isOwner && m.toLowerCase() !== list.ownerEmail.toLowerCase() && (
                <button onClick={() => removeEmail(m)} className="text-[10px] font-bold text-red-400 hover:text-red-300">remover</button>
              )}
            </div>
          ))}
        </div>

        {isOwner && (
          <div className="flex gap-2 mb-4">
            <input
              type="email"
              value={novo}
              onChange={(e) => setNovo(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEmail(); } }}
              placeholder="email para convidar"
              className="flex-1 py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <button onClick={addEmail} className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl">Convidar</button>
          </div>
        )}

        <div className="pt-3 border-t border-slate-800/80">
          {isOwner ? (
            <button onClick={onDeleteList} className="w-full py-2 bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-red-950/60">
              Apagar lista
            </button>
          ) : (
            <button onClick={onLeaveList} className="w-full py-2 bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-800">
              Sair da lista
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
