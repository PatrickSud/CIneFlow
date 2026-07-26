// Modal de detalhes de um título (sinopse, elenco, onde assistir).
import type { Item, WatchProviders, Provider } from '../types';
import { typeEmoji, typeLabel, isSerial, POSTER_FALLBACK } from '../lib/contentTypes';

interface DetailModalProps {
  item: Item;
  providers: WatchProviders | null;
  providersLoading: boolean;
  hasTmdbKey: boolean;
  onClose: () => void;
  onEdit: (item: Item) => void;
}

export default function DetailModal({
  item,
  providers,
  providersLoading,
  hasTmdbKey,
  onClose,
  onEdit,
}: DetailModalProps) {
  const runtime = item.runtime ?? 0;
  const numTemporadas = item.num_temporadas ?? 0;
  const numEpisodios = item.num_episodios ?? 0;

  const providerGroups: Array<[string, Provider[]]> = providers
    ? [
        ['Streaming', providers.flatrate],
        ['Alugar', providers.rent],
        ['Comprar', providers.buy],
      ]
    : [];
  const hasProviders =
    !!providers && (providers.flatrate.length > 0 || providers.rent.length > 0 || providers.buy.length > 0);

  return (
    <div className="fixed inset-0 z-[65] flex items-start justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="relative bg-slate-900 rounded-3xl border border-slate-800 max-w-lg w-full shadow-2xl my-8 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Backdrop / cabeçalho */}
        <div className="relative h-40 bg-slate-950">
          {item.backdrop_url ? (
            <img src={item.backdrop_url} alt="" className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-slate-900"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg"
          >
            ✕
          </button>
          <div className="absolute bottom-3 left-4 right-4 flex items-end gap-3">
            <img
              src={item.poster_url || POSTER_FALLBACK}
              alt={item.titulo}
              className="w-16 h-24 object-cover rounded-lg border border-slate-700 shadow-lg flex-shrink-0"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = POSTER_FALLBACK; }}
            />
            <div className="min-w-0 pb-1">
              <h3 className="text-base font-black text-white leading-tight drop-shadow">{item.titulo}</h3>
              <p className="text-[11px] text-slate-300 font-bold">
                {typeEmoji(item.tipo)} {typeLabel(item.tipo)} · {item.ano || 's/ ano'}
                {item.nota > 0 && <span className="text-amber-400"> · ★ {item.nota}/5</span>}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Meta */}
          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className={`px-2 py-1 rounded-lg font-bold border ${
              item.status_assistido === 'assistido' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/20' :
              item.status_assistido === 'em_andamento' ? 'bg-blue-950/60 text-blue-300 border-blue-500/20' :
              'bg-slate-950 text-slate-400 border-slate-800'
            }`}>
              {item.status_assistido === 'assistido' ? '✓ Assistido' : item.status_assistido === 'em_andamento' ? '🍿 Em Curso' : '⏳ Pendente'}
            </span>
            {runtime > 0 && (
              <span className="px-2 py-1 rounded-lg font-bold bg-slate-950 text-slate-300 border border-slate-800">
                ⏱️ {isSerial(item.tipo) ? `~${runtime} min/ep` : `${Math.floor(runtime / 60)}h ${runtime % 60}min`}
              </span>
            )}
            {isSerial(item.tipo) && numTemporadas > 0 && (
              <span className="px-2 py-1 rounded-lg font-bold bg-slate-950 text-slate-300 border border-slate-800">
                📺 {numTemporadas} temp. · {numEpisodios} ep.
              </span>
            )}
          </div>

          {/* Gêneros + Tags */}
          {(item.generos.length > 0 || item.tags.length > 0) && (
            <div className="flex flex-wrap gap-1.5">
              {item.generos.map((g, i) => (
                <span key={`g${i}`} className="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-800">{g}</span>
              ))}
              {item.tags.map((t, i) => (
                <span key={`t${i}`} className="text-[10px] bg-purple-950/50 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20">#{t}</span>
              ))}
            </div>
          )}

          {/* Sinopse */}
          {item.overview ? (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Sinopse</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{item.overview}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Sem sinopse. Configure uma chave TMDB e use "Atualizar TMDB" para enriquecer os dados.</p>
          )}

          {/* Notas pessoais */}
          {item.notas_pessoais && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">As suas notas</h4>
              <p className="text-xs text-slate-300 italic bg-slate-950/50 p-2 rounded-lg border border-slate-850">"{item.notas_pessoais}"</p>
            </div>
          )}

          {/* Elenco */}
          {Array.isArray(item.elenco) && item.elenco.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Elenco</h4>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {item.elenco.map((c, i) => (
                  <div key={i} className="flex-shrink-0 w-16 text-center">
                    <img
                      src={c.foto_url || POSTER_FALLBACK}
                      alt={c.nome}
                      className="w-16 h-20 object-cover rounded-lg bg-slate-950 border border-slate-800"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = POSTER_FALLBACK; }}
                    />
                    <p className="text-[9px] text-slate-300 font-bold mt-1 leading-tight truncate" title={c.nome}>{c.nome}</p>
                    {c.personagem && <p className="text-[8px] text-slate-500 leading-tight truncate" title={c.personagem}>{c.personagem}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Onde assistir */}
          {hasTmdbKey && item.tmdb_id && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Onde assistir (Brasil)</h4>
              {providersLoading ? (
                <p className="text-[11px] text-slate-500">A procurar...</p>
              ) : hasProviders ? (
                <div className="space-y-2">
                  {providerGroups.map(([lbl, list]) =>
                    list.length > 0 ? (
                      <div key={lbl} className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-500 font-bold w-16 flex-shrink-0">{lbl}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {list.map((p, i) => (
                            <span key={i} className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-1.5 py-1" title={p.nome}>
                              {p.logo_url ? <img src={p.logo_url} alt={p.nome} className="w-5 h-5 rounded" /> : null}
                              <span className="text-[9px] text-slate-300 font-semibold">{p.nome}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null
                  )}
                  {providers && providers.link && (
                    <a href={providers.link} target="_blank" rel="noreferrer" className="inline-block text-[10px] text-purple-400 underline">Ver no TMDB / JustWatch</a>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500">Sem informação de streaming para o Brasil.</p>
              )}
            </div>
          )}

          {/* Ações */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
            <button
              onClick={() => { onClose(); onEdit(item); }}
              className="px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl"
            >
              ✏️ Editar
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
