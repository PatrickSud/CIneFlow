// Integração com a API do TMDB (The Movie Database).
// Preenche automaticamente título, ano, gêneros e pôster ao adicionar um título.
//
// A chave pode vir de duas fontes (nesta ordem de prioridade):
//   1. Variável de ambiente VITE_TMDB_KEY (definida no build, ex.: arquivo .env)
//   2. Chave digitada pela pessoa na interface (salva no localStorage)
//
// Crie uma chave gratuita em: https://www.themoviedb.org/settings/api  (API Key v3)
import type { Tipo, TmdbSearchResult, TmdbDetails, WatchProviders, Provider, CastMember, TvSeason } from '../types';

const API_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/w300';
const KEY_STORAGE = 'cineflow_tmdb_key';
const LANG = 'pt-BR';

/** Erro com um código legível para a interface tratar. */
type CodedError = Error & { code?: string };

// --- Gestão da chave -------------------------------------------------------

const envKey: string =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_TMDB_KEY) || '';

export function getTmdbKey(): string {
  if (envKey) return envKey;
  try {
    return localStorage.getItem(KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function setTmdbKey(key: string): void {
  try {
    if (key) localStorage.setItem(KEY_STORAGE, key.trim());
    else localStorage.removeItem(KEY_STORAGE);
  } catch {
    /* ignora indisponibilidade do localStorage */
  }
}

// A chave veio do ambiente (build)? Nesse caso não deixamos editar na UI.
export const keyIsFromEnv: boolean = Boolean(envKey);

// --- Cache de gêneros ------------------------------------------------------

type GenreMap = Record<number, string>;
let genreCache: { movie: GenreMap; tv: GenreMap } | null = null;

async function loadGenres(key: string): Promise<{ movie: GenreMap; tv: GenreMap }> {
  if (genreCache) return genreCache;
  const build = async (kind: 'movie' | 'tv'): Promise<GenreMap> => {
    const res = await fetch(`${API_BASE}/genre/${kind}/list?api_key=${key}&language=${LANG}`);
    if (!res.ok) throw new Error('genre');
    const data = await res.json();
    const map: GenreMap = {};
    (data.genres || []).forEach((g: { id: number; name: string }) => {
      map[g.id] = g.name;
    });
    return map;
  };
  const [movie, tv] = await Promise.all([build('movie'), build('tv')]);
  genreCache = { movie, tv };
  return genreCache;
}

// --- Busca -----------------------------------------------------------------

/** Pesquisa filmes e séries no TMDB e devolve resultados já no formato do CineFlow. */
export async function searchTmdb(query: string): Promise<TmdbSearchResult[]> {
  const key = getTmdbKey();
  if (!key) {
    const err: CodedError = new Error('Sem chave TMDB configurada.');
    err.code = 'NO_KEY';
    throw err;
  }
  const q = query.trim();
  if (!q) return [];

  const res = await fetch(
    `${API_BASE}/search/multi?api_key=${key}&language=${LANG}&include_adult=false&query=${encodeURIComponent(q)}`
  );

  if (res.status === 401) {
    const err: CodedError = new Error('Chave TMDB inválida.');
    err.code = 'BAD_KEY';
    throw err;
  }
  if (!res.ok) throw new Error('Falha na busca do TMDB.');

  const data = await res.json();
  let genres: { movie: GenreMap; tv: GenreMap } = { movie: {}, tv: {} };
  try {
    genres = await loadGenres(key);
  } catch {
    /* segue sem nomes de gênero se o endpoint falhar */
  }

  return (data.results || [])
    .filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv')
    .map((r: any): TmdbSearchResult => {
      const isMovie = r.media_type === 'movie';
      const rawTitle = isMovie ? r.title : r.name;
      const date = isMovie ? r.release_date : r.first_air_date;
      const ano = date ? Number(String(date).slice(0, 4)) : null;
      const gMap = isMovie ? genres.movie : genres.tv;
      const genreIds: number[] = r.genre_ids || [];
      const generos = genreIds.map((id) => gMap[id]).filter(Boolean);

      // Detecção fina de tipo: documentário (gênero 99) e anime (animação + japonês).
      // 16 = Animação, 99 = Documentário (ids padrão do TMDB, iguais em filme e TV).
      let tipo: Tipo = isMovie ? 'movie' : 'series';
      if (genreIds.includes(99)) {
        tipo = 'documentary';
      } else if (genreIds.includes(16) && r.original_language === 'ja') {
        tipo = 'anime';
      }

      return {
        key: `${r.media_type}-${r.id}`,
        tmdb_id: r.id,
        media_type: r.media_type,
        tipo,
        titulo: rawTitle || 'Título Desconhecido',
        ano: ano && !Number.isNaN(ano) ? ano : null,
        generos,
        poster_url: r.poster_path ? `${IMG_BASE}${r.poster_path}` : '',
        overview: r.overview || '',
      };
    });
}

// --- Detalhes de um título ------------------------------------------------

const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w780';
const PROFILE_BASE = 'https://image.tmdb.org/t/p/w185';

/** Busca detalhes ricos: sinopse, duração, nº de temporadas/episódios, elenco e backdrop. */
export async function fetchTmdbDetails(
  params: { id: number; mediaType: 'movie' | 'tv' | string }
): Promise<TmdbDetails | null> {
  const { id, mediaType } = params;
  const key = getTmdbKey();
  if (!key || !id) return null;
  const type = mediaType === 'tv' ? 'tv' : 'movie';
  const res = await fetch(
    `${API_BASE}/${type}/${id}?api_key=${key}&language=${LANG}&append_to_response=credits`
  );
  if (!res.ok) throw new Error('details');
  const d = await res.json();

  const cast: CastMember[] = (d.credits?.cast || []).slice(0, 8).map((c: any) => ({
    nome: c.name,
    personagem: c.character || '',
    foto_url: c.profile_path ? `${PROFILE_BASE}${c.profile_path}` : '',
  }));

  let runtime = 0;
  if (type === 'movie') runtime = Number(d.runtime || 0);
  else if (Array.isArray(d.episode_run_time) && d.episode_run_time.length)
    runtime = Number(d.episode_run_time[0] || 0);

  return {
    overview: d.overview || '',
    runtime,
    num_temporadas: type === 'tv' ? Number(d.number_of_seasons || 0) : 0,
    num_episodios: type === 'tv' ? Number(d.number_of_episodes || 0) : 0,
    backdrop_url: d.backdrop_path ? `${BACKDROP_BASE}${d.backdrop_path}` : '',
    elenco: cast,
  };
}

/** Temporadas de uma série (para o rastreamento por episódio). */
export async function fetchTvSeasons(id: number): Promise<TvSeason[]> {
  const key = getTmdbKey();
  if (!key || !id) return [];
  const res = await fetch(`${API_BASE}/tv/${id}?api_key=${key}&language=${LANG}`);
  if (!res.ok) throw new Error('seasons');
  const d = await res.json();
  return (d.seasons || [])
    .filter((s: any) => Number(s.season_number) >= 1 && Number(s.episode_count) > 0)
    .map((s: any) => ({
      season_number: Number(s.season_number),
      name: s.name || `Temporada ${s.season_number}`,
      episode_count: Number(s.episode_count),
    }));
}

/** Onde assistir (streaming/aluguel/compra) por região. */
export async function fetchWatchProviders(
  params: { id: number; mediaType: 'movie' | 'tv' | string; region?: string }
): Promise<WatchProviders> {
  const { id, mediaType, region = 'BR' } = params;
  const key = getTmdbKey();
  if (!key || !id) return { link: '', flatrate: [], rent: [], buy: [] };
  const type = mediaType === 'tv' ? 'tv' : 'movie';
  const res = await fetch(`${API_BASE}/${type}/${id}/watch/providers?api_key=${key}`);
  if (!res.ok) throw new Error('providers');
  const data = await res.json();
  const r = (data.results && data.results[region]) || {};
  const mapList = (arr: any[]): Provider[] =>
    (arr || []).map((p) => ({
      nome: p.provider_name,
      logo_url: p.logo_path ? `${PROFILE_BASE}${p.logo_path}` : '',
    }));
  return {
    link: r.link || '',
    flatrate: mapList(r.flatrate),
    rent: mapList(r.rent),
    buy: mapList(r.buy),
  };
}
