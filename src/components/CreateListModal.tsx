// Modal para criar uma lista compartilhada.
import { useState } from 'react';

interface CreateListModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (nome: string, members: string[]) => void;
}

export default function CreateListModal({ open, onClose, onCreate }: CreateListModalProps) {
  const [nome, setNome] = useState('');
  const [emails, setEmails] = useState('');
  if (!open) return null;

  const submit = () => {
    if (!nome.trim()) return;
    const members = emails.split(/[,\n;]+/).map((e) => e.trim()).filter(Boolean);
    onCreate(nome.trim(), members);
    setNome('');
    setEmails('');
  };

  return (
    <div className="fixed inset-0 z-[76] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-slate-900 rounded-3xl border border-slate-800 max-w-sm w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-12 bg-purple-950/60 border border-purple-500/30 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">📑</div>
        <h3 className="text-sm font-black text-white text-center mb-1">Nova lista</h3>
        <p className="text-xs text-slate-400 text-center mb-4">
          Organize seus títulos em listas (ex.: "Favoritos", "Ver no fim de semana"). O compartilhamento é opcional — convide alguém só se quiser.
        </p>

        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Nome da lista</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Família, Cinema com amigos..."
          className="block w-full mt-1 mb-3 py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
        />

        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Compartilhar por email (opcional)</label>
        <textarea
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          placeholder="emails separados por vírgula"
          rows={2}
          className="block w-full mt-1 mb-1 py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
        <p className="text-[10px] text-slate-600 mb-4">A pessoa precisa entrar no CineFlow com esse mesmo email do Google.</p>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl">
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={!nome.trim()}
            className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl"
          >
            Criar
          </button>
        </div>
      </div>
    </div>
  );
}
