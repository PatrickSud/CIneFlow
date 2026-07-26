// Rastreamento por episódio: marca episódios vistos por temporada (estrutura do TMDB).
import { useEffect, useState } from 'react';
import type { Item, TvSeason } from '../types';
import { fetchTvSeasons } from '../lib/tmdb';

interface EpisodeTrackerModalProps {
  open: boolean;
  item: Item | null;
  onClose: () => void;
  onSave: (itemId: string, map: Record<string, number[]>, totalEpisodios: number) => void;
}

export default function EpisodeTrackerModal({ open, item, onClose, onSave }: EpisodeTrackerModalProps) {
  const [seasons, setSeasons] = useState<TvSeason[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [map, setMap] = useState<Record<string, number[]>>({});
  const [openSeason, setOpenSeason] = useState<number | null>(null);

  useEffect(() => {
    if (!open || !item) return;
    setMap({ ...(item.episodios_vistos || {}) });
    setError('');
    if (!item.tmdb_id) {
      setSeasons([]);
      setError('Este título não está vinculado ao TMDB. Use "Atualizar TMDB" ou adicione-o pela busca para carregar as temporadas.');
      return;
    }
    let active = true;
    setLoading(true);
    fetchTvSeasons(item.tmdb_id)
      .then((s) => { if (active) { setSeasons(s); setOpenSeason(s[0]?.season_number ?? null); } })
      .catch(() => { if (active) setError('Não foi possível carregar as temporadas agora.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open, item]);

  if (!open || !item) return null;

  const watchedIn = (sn: number) => map[String(sn)] || [];
  const totalEp = seasons.reduce((a, s) => a + s.episode_count, 0);
  const watchedTotal = Object.values(map).reduce((a, arr) => a + arr.length, 0);

  const toggleEp = (sn: number, ep: number) => {
    setMap((prev) => {
      const key = String(sn);
      const cur = prev[key] || [];
      const next = cur.includes(ep) ? cur.filter((x) => x !== ep) : [...cur, ep].sort((a, b) => a - b);
      return { ...prev, [key]: next };
    });
  };
  const setSeasonAll = (sn: number, count: number, on: boolean) => {
    setMap((prev) => ({ ...prev, [String(sn)]: on ? Array.from({ length: count }, (_, i) => i + 1) : [] }));
  };

  const save = () => {
    // remove temporadas vazias para não guardar lixo
    const clean: Record<string, number[]> = {};
    Object.entries(map).forEach(([k, v]) => { if (v.length) clean[k] = v; });
    onSave(item.id, clean, totalEp);
  };

  return (
    <div className="fixed inset-0 z-[78] flex items-start justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="relative bg-slate-900 rounded-3xl border border-slate-800 max-w-md w-full p-6 shadow-2xl my-8" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Fechar" className="absolute top-4 right-4 p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 rounded-lg border border-slate-800">✕</button>
        <h3 className="text-sm font-black text-white mb-0.5">📺 Episódios</h3>
        <p className="text-xs text-slate-400 mb-4 truncate">{item.titulo}</p>

        {loading ? (
          <div className="py-10 text-center">
            <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-400">Carregando temporadas…</p>
          </div>
        ) : error ? (
          <p className="text-xs text-slate-400 bg-slate-950/60 border border-slate-800 rounded-xl p-3">{error}</p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="text-slate-400">Progresso total</span>
              <span className="font-black text-purple-400">{watchedTotal}/{totalEp} episódios</span>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {seasons.map((s) => {
                const w = watchedIn(s.season_number);
                const isOpen = openSeason === s.season_number;
                const allOn = w.length === s.episode_count;
                return (
                  <div key={s.season_number} className="bg-slate-950/50 border border-slate-800 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenSeason(isOpen ? null : s.season_number)}
                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-800/40 transition-colors"
                    >
                      <span className="text-xs font-bold text-slate-200 text-left">{s.name}</span>
                      <span className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold ${allOn ? 'text-emerald-400' : 'text-slate-500'}`}>{w.length}/{s.episode_count}</span>
                        <span className="text-[9px] text-slate-500">{isOpen ? '▲' : '▼'}</span>
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-3 pb-3">
                        <div className="flex gap-2 mb-2">
                          <button onClick={() => setSeasonAll(s.season_number, s.episode_count, true)} className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300">marcar tudo</button>
                          <button onClick={() => setSeasonAll(s.season_number, s.episode_count, false)} className="text-[10px] font-bold text-slate-500 hover:text-slate-300">limpar</button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {Array.from({ length: s.episode_count }, (_, i) => i + 1).map((ep) => {
                            const on = w.includes(ep);
                            return (
                              <button
                                key={ep}
                                onClick={() => toggleEp(s.season_number, ep)}
                                title={`Episódio ${ep}`}
                                className={`w-7 h-7 rounded-lg text-[10px] font-bold border transition-all ${
                                  on ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-purple-500/40'
                                }`}
                              >
                                {ep}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2 pt-4">
              <button onClick={onClose} className="flex-1 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl">
                Cancelar
              </button>
              <button onClick={save} className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl">
                Salvar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
