// Cartão compacto (grade de pôsteres) para a visualização de alta densidade.
import type { Item } from '../types';
import { typeEmoji, typeLabel, POSTER_FALLBACK, priorityInfo } from '../lib/contentTypes';

interface CompactCardProps {
  item: Item;
  onOpenDetail: (item: Item) => void;
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export default function CompactCard({
  item,
  onOpenDetail,
  selectionMode = false,
  selected = false,
  onToggleSelect,
}: CompactCardProps) {
  const prio = priorityInfo(item.prioridade);
  const statusRing =
    item.status_assistido === 'assistido' ? 'ring-emerald-500/70' :
    item.status_assistido === 'em_andamento' ? 'ring-blue-500/70' :
    'ring-transparent';

  const handleClick = () => {
    if (selectionMode) onToggleSelect?.(item.id);
    else onOpenDetail(item);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={item.titulo}
      className={`group relative block w-full text-left rounded-xl overflow-hidden bg-slate-950 border transition-all ${
        selected ? 'border-purple-500 ring-2 ring-purple-500/60' : 'border-slate-800 hover:border-purple-500/40'
      }`}
    >
      <div className="relative aspect-[2/3] bg-slate-900">
        <img
          src={item.poster_url || POSTER_FALLBACK}
          alt={item.titulo}
          loading="lazy"
          className={`w-full h-full object-cover ring-2 ring-inset ${statusRing}`}
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = POSTER_FALLBACK; }}
        />
        {/* Selo de tipo */}
        <span className="absolute top-1 left-1 bg-black/80 px-1.5 py-0.5 rounded text-[11px] font-bold text-slate-200" title={typeLabel(item.tipo)}>
          {typeEmoji(item.tipo)}
        </span>
        {/* Prioridade */}
        {prio.v > 0 && (
          <span className="absolute top-1 right-1 text-[12px]" title={`Prioridade: ${prio.label}`}>{prio.dot}</span>
        )}
        {/* Nota */}
        {item.nota > 0 && (
          <span className="absolute bottom-1 left-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-300">★ {item.nota}</span>
        )}
        {/* Indicador de seleção */}
        {selectionMode && (
          <span className={`absolute bottom-1 right-1 w-6 h-6 flex items-center justify-center rounded-full border-2 text-xs font-black shadow ${
            selected ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-950/90 border-slate-500 text-transparent'
          }`}>✓</span>
        )}
        {/* Gradiente para o título */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/90 to-transparent pointer-events-none"></div>
      </div>
      <p className="absolute bottom-1.5 left-2 right-2 text-[11px] font-bold text-white leading-tight line-clamp-2 drop-shadow">
        {item.titulo}
      </p>
    </button>
  );
}
