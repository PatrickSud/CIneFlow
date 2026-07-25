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
      const generos = (r.genre_ids || [])
        .map((id) => gMap[id])
        .filter(Boolean);
      return {
        key: `${r.media_type}-${r.id}`,
        tipo: isMovie ? 'movie' : 'series',
        titulo: rawTitle || 'Título Desconhecido',
        ano: ano && !Number.isNaN(ano) ? ano : null,
        generos,
        poster_url: r.poster_path ? `${IMG_BASE}${r.poster_path}` : '',
        overview: r.overview || '',
      };
    });
}
