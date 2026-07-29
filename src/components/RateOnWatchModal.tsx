// Modal de classificação exibido ao marcar um título como assistido.
import { useState, useEffect } from 'react';
import type { Item } from '../types';
import StarRating from './StarRating';
import { typeEmoji, typeLabel, POSTER_FALLBACK } from '../lib/contentTypes';

interface RateOnWatchModalProps {
  item: Item | null;
  onCancel: () => void;
  onConfirm: (id: string, nota: number) => void;
}

export default function RateOnWatchModal({ item, onCancel, onConfirm }: RateOnWatchModalProps) {
  const [nota, setNota] = useState(0);
  useEffect(() => { setNota(item?.nota || 0); }, [item]);
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-slate-900 rounded-3xl border border-slate-800 max-w-xs w-full p-6 shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-12 bg-emerald-950/60 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">✓</div>
        <h3 className="text-sm font-black text-white mb-1">Marcar como assistido</h3>
        <p className="text-xs text-slate-400 mb-0.5 truncate" title={item.titulo}>
          {typeEmoji(item.tipo)} {item.titulo}
        </p>
        <p className="text-[11px] text-slate-500 mb-4">Que nota você dá? (opcional)</p>

        <img
          src={item.poster_url || POSTER_FALLBACK}
          alt={item.titulo}
          className="w-16 h-24 object-cover rounded-lg border border-slate-800 mx-auto mb-4"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = POSTER_FALLBACK; }}
        />

        <div className="flex justify-center items-center gap-1 mb-2">
          <StarRating value={nota} onRate={setNota} sizeClass="w-7 h-7" strongGlow />
        </div>
        {nota > 0 && (
          <button onClick={() => setNota(0)} className="text-[10px] text-slate-500 hover:text-slate-300 underline mb-4">
            Limpar nota
          </button>
        )}
        {nota === 0 && <p className="text-[10px] text-slate-600 mb-4">Sem nota — apenas registrar que assistiu.</p>}

        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl">
            Cancelar
          </button>
          <button onClick={() => onConfirm(item.id, nota)} className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl">
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
