// Integração com a API do TMDB (The Movie Database).
// Preenche automaticamente título, ano, gêneros e pôster ao adicionar um título.
//
// A chave pode vir de duas fontes (nesta ordem de prioridade):
//   1. Variável de ambiente VITE_TMDB_KEY (definida no build, ex.: arquivo .env)
//   2. Chave digitada pela pessoa na interface (guardada no localStorage)
//
// Crie uma chave gratuita em: https://www.themoviedb.org/settings/api  (API Key v3)

const API_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/w300';
const KEY_STORAGE = 'cineflow_tmdb_key';
const LANG = 'pt-BR';

// --- Gestão da chave -------------------------------------------------------

const envKey =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_TMDB_KEY) ||
  '';

export function getTmdbKey() {
  if (envKey) return envKey;
  try {
    return localStorage.getItem(KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function setTmdbKey(key) {
  try {
    if (key) localStorage.setItem(KEY_STORAGE, key.trim());
    else localStorage.removeItem(KEY_STORAGE);
  } catch {
    /* ignora indisponibilidade do localStorage */
  }
}

// A chave veio do ambiente (build)? Nesse caso não deixamos editar na UI.
export const keyIsFromEnv = Boolean(envKey);

// --- Cache de gêneros ------------------------------------------------------

let genreCache = null; // { movie: {id:nome}, tv: {id:nome} }

async function loadGenres(key) {
  if (genreCache) return genreCache;
  const build = async (kind) => {
    const res = await fetch(
      `${API_BASE}/genre/${kind}/list?api_key=${key}&language=${LANG}`
    );
    if (!res.ok) throw new Error('genre');
    const data = await res.json();
    const map = {};
    (data.genres || []).forEach((g) => {
      map[g.id] = g.name;
    });
    return map;
  };
  const [movie, tv] = await Promise.all([build('movie'), build('tv')]);
  genreCache = { movie, tv };
  return genreCache;
}

// --- Busca -----------------------------------------------------------------

/**
 * Pesquisa filmes e séries no TMDB e devolve resultados já no formato do CineFlow.
 * @param {string} query
 * @returns {Promise<Array<{key:string,tipo:string,titulo:string,ano:number|null,generos:string[],poster_url:string,overview:string}>>}
 */
export async function searchTmdb(query) {
  const key = getTmdbKey();
  if (!key) {
    const err = new Error('Sem chave TMDB configurada.');
    err.code = 'NO_KEY';
    throw err;
  }
  const q = query.trim();
  if (!q) return [];

  const res = await fetch(
    `${API_BASE}/search/multi?api_key=${key}&language=${LANG}&include_adult=false&query=${encodeURIComponent(
      q
    )}`
  );

  if (res.status === 401) {
    const err = new Error('Chave TMDB inválida.');
    err.code = 'BAD_KEY';
    throw err;
  }
  if (!res.ok) throw new Error('Falha na busca do TMDB.');

  const data = await res.json();
  let genres = { movie: {}, tv: {} };
  try {
    genres = await loadGenres(key);
  } catch {
    /* segue sem nomes de gênero se o endpoint falhar */
  }

  return (data.results || [])
    .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
    .map((r) => {
      const isMovie = r.media_type === 'movie';
      const rawTitle = isMovie ? r.title : r.name;
      const date = isMovie ? r.release_date : r.first_air_date;
      const ano = date ? Number(String(date).slice(0, 4)) : null;
      const gMap = isMovie ? genres.movie : genres.tv;
      const genreIds = r.genre_ids || [];
      const generos = genreIds.map((id) => gMap[id]).filter(Boolean);

      // Detecção fina de tipo: documentário (gênero 99) e anime (animação + japonês).
      // 16 = Animação, 99 = Documentário (ids padrão do TMDB, iguais em filme e TV).
      let tipo = isMovie ? 'movie' : 'series';
      if (genreIds.includes(99)) {
        tipo = 'documentary';
      } else if (genreIds.includes(16) && r.original_language === 'ja') {
        tipo = 'anime';
      }

      return {
        key: `${r.media_type}-${r.id}`,
        tmdb_id: r.id,
        media_type: r.media_type, // 'movie' | 'tv' (para buscar detalhes depois)
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

/**
 * Busca detalhes ricos de um título: sinopse, duração, nº de temporadas/episódios,
 * elenco principal e imagem de fundo (backdrop).
 * @param {{id:number, mediaType:'movie'|'tv'}} params
 */
export async function fetchTmdbDetails({ id, mediaType }) {
  const key = getTmdbKey();
  if (!key || !id) return null;
  const type = mediaType === 'tv' ? 'tv' : 'movie';
  const res = await fetch(
    `${API_BASE}/${type}/${id}?api_key=${key}&language=${LANG}&append_to_response=credits`
  );
  if (!res.ok) throw new Error('details');
  const d = await res.json();

  const cast = (d.credits?.cast || []).slice(0, 8).map((c) => ({
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
    runtime, // minutos
    num_temporadas: type === 'tv' ? Number(d.number_of_seasons || 0) : 0,
    num_episodios: type === 'tv' ? Number(d.number_of_episodes || 0) : 0,
    backdrop_url: d.backdrop_path ? `${BACKDROP_BASE}${d.backdrop_path}` : '',
    elenco: cast,
  };
}

/**
 * Onde assistir (streaming/aluguel/compra) por região.
 * @param {{id:number, mediaType:'movie'|'tv', region?:string}} params
 */
export async function fetchWatchProviders({ id, mediaType, region = 'BR' }) {
  const key = getTmdbKey();
  if (!key || !id) return { link: '', flatrate: [], rent: [], buy: [] };
  const type = mediaType === 'tv' ? 'tv' : 'movie';
  const res = await fetch(`${API_BASE}/${type}/${id}/watch/providers?api_key=${key}`);
  if (!res.ok) throw new Error('providers');
  const data = await res.json();
  const r = (data.results && data.results[region]) || {};
  const mapList = (arr) =>
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
