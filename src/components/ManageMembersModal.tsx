// Modal para gerenciar membros de uma lista compartilhada.
import { useState } from 'react';
import type { SharedList } from '../types';

interface ManageMembersModalProps {
  open: boolean;
  list: SharedList | null;
  currentEmail: string;
  shareUrl: string;
  onClose: () => void;
  onSaveMembers: (emails: string[]) => void;
  onTogglePublic: (publico: boolean) => void;
  onDeleteList: () => void;
  onLeaveList: () => void;
  onShare?: () => void;
}

export default function ManageMembersModal({
  open,
  list,
  currentEmail,
  shareUrl,
  onClose,
  onSaveMembers,
  onTogglePublic,
  onDeleteList,
  onLeaveList,
  onShare,
}: ManageMembersModalProps) {
  const [novo, setNovo] = useState('');
  const [copied, setCopied] = useState(false);
  if (!open || !list) return null;

  const isOwner = list.ownerEmail.toLowerCase() === currentEmail.toLowerCase();

  const copyLink = () => {
    try {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

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
        <p className="text-xs text-slate-400 mb-4">Defina quem visualiza e quem edita esta lista.</p>

        {/* Acesso de VISUALIZAÇÃO (link público, somente leitura) */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 mb-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-slate-200">👁️ Acesso de visualização</p>
              <p className="text-[10px] text-slate-500">Link público — qualquer pessoa com ele vê a lista (somente leitura), sem precisar de login.</p>
            </div>
            {isOwner ? (
              <button
                onClick={() => onTogglePublic(!list.publico)}
                className={`px-2.5 py-1.5 text-[10px] font-black uppercase rounded-lg border transition-colors whitespace-nowrap ${
                  list.publico ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30' : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                {list.publico ? 'Ativado' : 'Desativado'}
              </button>
            ) : (
              <span className="text-[10px] text-slate-500">{list.publico ? 'público' : 'privado'}</span>
            )}
          </div>
          {list.publico && (
            <>
              <div className="flex gap-2 mt-2">
                <input readOnly value={shareUrl} className="flex-1 min-w-0 py-1.5 px-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-[10px] focus:outline-none" />
                <button onClick={copyLink} className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold rounded-lg whitespace-nowrap">
                  {copied ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
              {onShare && (
                <button onClick={onShare} className="w-full mt-2 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold rounded-lg">
                  🔗 Compartilhar link
                </button>
              )}
            </>
          )}
        </div>

        {/* Acesso de EDIÇÃO (por convite / login) */}
        <p className="text-xs font-bold text-slate-200 mb-1">✏️ Acesso de edição</p>
        <p className="text-[10px] text-slate-500 mb-2">Convidados por e-mail podem editar a lista. Precisam entrar no CineFlow com esse mesmo e-mail do Google.</p>

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
