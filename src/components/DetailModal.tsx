// Modal de detalhes de um título (sinopse, elenco, onde assistir).
import { useState, useEffect, useRef } from 'react';
import type { Item, Status, WatchProviders, Provider } from '../types';
import { typeEmoji, typeLabel, isSerial, POSTER_FALLBACK, PRIORITIES, classificacaoInfo } from '../lib/contentTypes';
import { countWatchedEpisodes } from '../lib/library';
import StarRating from './StarRating';

const STATUS_OPTS: { v: Status; label: string; chip: string }[] = [
  { v: 'nao_assistido', label: '⏳ Pendente', chip: 'bg-slate-700 text-white border-slate-600' },
  { v: 'em_andamento',  label: '🍿 Em Curso', chip: 'bg-blue-600 text-white border-blue-500' },
  { v: 'assistido',     label: '✓ Assistido', chip: 'bg-emerald-600 text-white border-emerald-500' },
];

interface DetailModalProps {
  item: Item;
  providers: WatchProviders | null;
  providersLoading: boolean;
  hasTmdbKey: boolean;
  onClose: () => void;
  onOpenEpisodes: (item: Item) => void;
  onSetPriority: (id: string, value: number) => void;
  onSetStatus: (id: string, status: Status) => void;
  onRate: (id: string, star: number) => void;
  onAddItemTag: (id: string, tag: string) => void;
  onRemoveItemTag: (id: string, tag: string) => void;
  onDelete: (id: string, titulo: string) => void;
  allTags: string[];
  onRefresh: (item: Item) => Promise<void>;
  // Modo pré-visualização: título vindo do TMDB, ainda não na biblioteca.
  preview?: boolean;
  alreadyInLibrary?: boolean;
  onAdd?: () => void;
  onReview?: () => void;
}

export default function DetailModal({
  item,
  providers,
  providersLoading,
  hasTmdbKey,
  onClose,
  onOpenEpisodes,
  onSetPriority,
  onSetStatus,
  onRate,
  onAddItemTag,
  onRemoveItemTag,
  onDelete,
  allTags,
  onRefresh,
  preview = false,
  alreadyInLibrary = false,
  onAdd,
  onReview,
}: DetailModalProps) {
  const episodiosVistos = countWatchedEpisodes(item.episodios_vistos);
  const [refreshing, setRefreshing] = useState(false);
  const [zoomImg, setZoomImg] = useState<string | null>(null);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [tagDraft, setTagDraft] = useState('');
  const trailerBoxRef = useRef<HTMLDivElement | null>(null);
  const itemTags = item.tags || [];
  const suggestTags = allTags.filter((t) => !itemTags.some((x) => x.toLowerCase() === t.toLowerCase()));
  const addTagFromDraft = () => {
    const v = tagDraft.trim();
    if (!v) return;
    onAddItemTag(item.id, v);
    setTagDraft('');
  };
  // Cor de destaque extraída do pôster (rgb "r, g, b"); null = usa o padrão roxo.
  const [accent, setAccent] = useState<string | null>(null);

  useEffect(() => {
    setAccent(null);
    const src = item.poster_url;
    if (!src) return;
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = 16, h = 24;
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        const { data } = ctx.getImageData(0, 0, w, h);
        let best = { r: 124, g: 58, b: 237 };
        let bestScore = -1;
        let ar = 0, ag = 0, ab = 0, n = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 200) continue;
          ar += r; ag += g; ab += b; n++;
          const max = Math.max(r, g, b), min = Math.min(r, g, b);
          const sat = max === 0 ? 0 : (max - min) / max;
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          const score = sat * (1 - Math.abs(lum - 0.5)); // vibrante e nem escuro nem claro demais
          if (score > bestScore) { bestScore = score; best = { r, g, b }; }
        }
        const pick = bestScore > 0.12 ? best : (n ? { r: Math.round(ar / n), g: Math.round(ag / n), b: Math.round(ab / n) } : best);
        if (!cancelled) setAccent(`${pick.r}, ${pick.g}, ${pick.b}`);
      } catch { /* CORS/canvas: mantém o padrão */ }
    };
    img.onerror = () => { /* mantém o padrão */ };
    img.src = src;
    return () => { cancelled = true; };
  }, [item.poster_url]);

  // Ao abrir o trailer, tenta tela cheia em paisagem (best-effort; ignora se não suportado).
  useEffect(() => {
    if (!trailerOpen) return;
    const el = trailerBoxRef.current as (HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }) | null;
    const orient = (screen as any)?.orientation;
    (async () => {
      try {
        if (el?.requestFullscreen) await el.requestFullscreen();
        else if (el?.webkitRequestFullscreen) await el.webkitRequestFullscreen();
        if (orient?.lock) { try { await orient.lock('landscape'); } catch { /* sem suporte */ } }
      } catch { /* sem suporte a tela cheia */ }
    })();
    return () => {
      try { if (orient?.unlock) orient.unlock(); } catch { /* ignora */ }
      try { if (document.fullscreenElement) document.exitFullscreen(); } catch { /* ignora */ }
    };
  }, [trailerOpen]);

  const doRefresh = async () => {
    setRefreshing(true);
    try { await onRefresh(item); } finally { setRefreshing(false); }
  };
  const runtime = item.runtime ?? 0;
  const numTemporadas = item.num_temporadas ?? 0;
  const numEpisodios = item.num_episodios ?? 0;
  // Títulos antigos podem não ter estes arrays — protegemos contra undefined.
  const generos = item.generos || [];
  const tags = item.tags || [];
  const elenco = item.elenco || [];

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
    <>
    <div className="fixed inset-0 z-[65] flex items-start justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div
        className="relative bg-slate-900 rounded-3xl border border-slate-800 max-w-lg w-full shadow-2xl my-8 overflow-hidden"
        style={accent ? { boxShadow: `0 20px 60px -15px rgba(${accent}, 0.45)` } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Backdrop / cabeçalho */}
        <div className="relative h-40 bg-slate-950">
          {item.backdrop_url ? (
            <img
              src={item.backdrop_url}
              alt=""
              onClick={() => setZoomImg(item.backdrop_url || null)}
              className="w-full h-full object-cover opacity-60 cursor-zoom-in"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{ background: `linear-gradient(135deg, rgba(${accent || '124, 58, 237'}, 0.45), #0f172a)` }}
            ></div>
          )}
          {/* Tonalidade de destaque a partir do pôster */}
          {accent && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: `linear-gradient(to top, rgba(${accent}, 0), rgba(${accent}, 0.4))` }}
            ></div>
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
              onClick={() => item.poster_url && setZoomImg(item.poster_url)}
              title="Ampliar imagem"
              className="w-16 h-24 object-cover rounded-lg border border-slate-700 shadow-lg flex-shrink-0 cursor-zoom-in hover:brightness-110 transition"
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
            {(() => {
              const ci = classificacaoInfo(item.classificacao);
              return ci ? (
                <span className={`px-2 py-1 rounded-lg font-black border ${ci.classes}`} title={ci.descricao}>
                  {ci.label}
                </span>
              ) : null;
            })()}
            {!preview && (
              <span className={`px-2 py-1 rounded-lg font-bold border ${
                item.status_assistido === 'assistido' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/20' :
                item.status_assistido === 'em_andamento' ? 'bg-blue-950/60 text-blue-300 border-blue-500/20' :
                'bg-slate-950 text-slate-400 border-slate-800'
              }`}>
                {item.status_assistido === 'assistido' ? '✓ Assistido' : item.status_assistido === 'em_andamento' ? '🍿 Em Curso' : '⏳ Pendente'}
              </span>
            )}
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
            {isSerial(item.tipo) && episodiosVistos > 0 && (
              <span className="px-2 py-1 rounded-lg font-bold bg-purple-950/60 text-purple-300 border border-purple-500/20">
                ✓ {episodiosVistos}{numEpisodios > 0 ? `/${numEpisodios}` : ''} ep. vistos
              </span>
            )}
          </div>

          {/* Trailer (YouTube) */}
          {item.trailer_key && (
            <button
              onClick={() => setTrailerOpen(true)}
              className="w-full flex items-center justify-center gap-2 text-[12px] font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl py-2.5 transition-colors shadow-lg shadow-red-900/20"
            >
              ▶ Assistir trailer
            </button>
          )}

          {/* Rastrear episódios (séries) */}
          {!preview && isSerial(item.tipo) && (
            <button
              onClick={() => onOpenEpisodes(item)}
              className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-purple-300 bg-purple-950/40 border border-purple-500/30 rounded-xl py-2 hover:bg-purple-950/60 transition-colors"
            >
              📺 Marcar episódios vistos
            </button>
          )}

          {/* Gêneros */}
          {generos.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {generos.map((g, i) => (
                <span key={`g${i}`} className="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-800">{g}</span>
              ))}
            </div>
          )}

          {preview && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t, i) => (
                <span key={`t${i}`} className="text-[10px] bg-purple-950/50 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20">#{t}</span>
              ))}
            </div>
          )}

          {/* Edição rápida: estado, classificação, prioridade e tags */}
          {!preview && (
            <div className="space-y-3 bg-slate-950/40 border border-slate-800 rounded-2xl p-3">
              {/* Estado de visualização */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Estado de visualização</h4>
                <div className="flex gap-1.5 flex-wrap">
                  {STATUS_OPTS.map((s) => {
                    const on = item.status_assistido === s.v;
                    return (
                      <button
                        key={s.v}
                        onClick={() => onSetStatus(item.id, s.v)}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
                          on ? s.chip : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Classificação (estrelas) */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Sua classificação</h4>
                <StarRating value={item.nota || 0} onRate={(star) => onRate(item.id, star)} />
              </div>

              {/* Prioridade (watchlist) */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Prioridade</h4>
                <div className="flex gap-1.5 flex-wrap">
                  {PRIORITIES.map((p) => {
                    const on = (item.prioridade || 0) === p.v;
                    return (
                      <button
                        key={p.v}
                        onClick={() => onSetPriority(item.id, p.v)}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
                          on ? p.chip : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        {p.v > 0 ? `${p.dot} ` : ''}{p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Tags</h4>
                {itemTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {itemTags.map((t) => (
                      <span key={t} className="inline-flex items-center gap-0.5 bg-purple-950/50 text-purple-300 text-[11px] px-2 py-0.5 rounded border border-purple-500/20">
                        #{t}
                        <button onClick={() => onRemoveItemTag(item.id, t)} title="Remover" className="text-purple-400/60 hover:text-red-300 font-bold leading-none ml-0.5">×</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={tagDraft}
                    onChange={(e) => setTagDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTagFromDraft(); } }}
                    placeholder="Nova tag…"
                    className="flex-1 min-w-0 py-1.5 px-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <button onClick={addTagFromDraft} disabled={!tagDraft.trim()} className="px-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-bold rounded-lg">+</button>
                </div>
                {suggestTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 max-h-20 overflow-y-auto">
                    {suggestTags.map((t) => (
                      <button key={t} onClick={() => onAddItemTag(item.id, t)} className="text-[10px] text-slate-300 bg-slate-950 border border-slate-800 hover:border-purple-500/40 hover:text-purple-300 px-1.5 py-0.5 rounded-lg transition-colors">+ {t}</button>
                    ))}
                  </div>
                )}
              </div>
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
          {elenco.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Elenco</h4>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {elenco.map((c, i) => (
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
                <p className="text-[11px] text-slate-500">Procurando...</p>
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
          {preview ? (
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2 flex-wrap">
              {alreadyInLibrary ? (
                <span className="mr-auto text-[11px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/20 px-3 py-2 rounded-xl">✓ Já está na sua biblioteca</span>
              ) : (
                <>
                  <button
                    onClick={() => onAdd && onAdd()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl mr-auto"
                  >
                    ➕ Adicionar à biblioteca
                  </button>
                  <button
                    onClick={() => onReview && onReview()}
                    className="px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl"
                  >
                    ✏️ Revisar e adicionar
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl"
              >
                Fechar
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
              {hasTmdbKey && (
                <button
                  onClick={doRefresh}
                  disabled={refreshing}
                  title="Atualizar os dados deste título pelo TMDB"
                  className="px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-60 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl mr-auto"
                >
                  {refreshing ? '⏳ Atualizando…' : '🔄 Atualizar TMDB'}
                </button>
              )}
              <button
                onClick={() => { onClose(); onDelete(item.id, item.titulo); }}
                className="px-4 py-2 bg-red-950/60 border border-red-500/30 hover:bg-red-950 text-red-300 text-xs font-bold uppercase tracking-wider rounded-xl"
              >
                🗑️ Excluir
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Lightbox: imagem maximizada */}
    {zoomImg && (
      <div
        className="fixed inset-0 z-[90] flex items-center justify-center bg-black/95 p-4 cursor-zoom-out"
        onClick={() => setZoomImg(null)}
      >
        <button
          onClick={() => setZoomImg(null)}
          aria-label="Fechar imagem"
          className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-lg leading-none"
        >
          ✕
        </button>
        <img
          src={zoomImg}
          alt={item.titulo}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    )}

    {/* Trailer do YouTube */}
    {trailerOpen && item.trailer_key && (
      <div
        className="fixed inset-0 z-[90] flex items-center justify-center bg-black/95 p-4"
        onClick={() => setTrailerOpen(false)}
      >
        <button
          onClick={() => setTrailerOpen(false)}
          aria-label="Fechar trailer"
          className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-lg leading-none"
        >
          ✕
        </button>
        <div ref={trailerBoxRef} className="w-full max-w-3xl aspect-video bg-black flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
          <iframe
            className="w-full h-full rounded-xl shadow-2xl"
            src={`https://www.youtube.com/embed/${item.trailer_key}?autoplay=1&rel=0&playsinline=1`}
            title={`Trailer — ${item.titulo}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    )}
    </>
  );
}
