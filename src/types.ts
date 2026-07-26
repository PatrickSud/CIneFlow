// Tipos centrais do CineFlow — o "contrato" dos dados usados pela aplicação.

/** Tipos de conteúdo suportados (ids). */
export type Tipo =
  | 'movie'
  | 'series'
  | 'anime'
  | 'documentary'
  | 'miniseries'
  | 'tvshow'
  | 'standup';

/** Estado de visualização de um título. */
export type Status = 'assistido' | 'em_andamento' | 'nao_assistido';

/** Um membro do elenco (vindo do TMDB). */
export interface CastMember {
  nome: string;
  personagem: string;
  foto_url: string;
}

/** Um título da biblioteca. Campos de enriquecimento (TMDB) são opcionais. */
export interface Item {
  id: string;
  titulo: string;
  tipo: Tipo;
  ano: number;
  generos: string[];
  data_adicao: string;
  poster_url: string;
  status_assistido: Status;
  progresso_porcentagem: number;
  temporadas_assistidas_max: number;
  temporada_atual: number;
  episodio_atual: number;
  nota: number;
  notas_pessoais: string;
  tags: string[];
  // Enriquecimento opcional
  overview?: string;
  runtime?: number;
  num_temporadas?: number;
  num_episodios?: number;
  elenco?: CastMember[];
  backdrop_url?: string;
  tmdb_id?: number | null;
  tmdb_media_type?: string;
  // Rastreamento por episódio: temporada -> lista de episódios vistos
  episodios_vistos?: Record<string, number[]>;
  // Prioridade na watchlist: 0 = nenhuma, 1 = média, 2 = alta
  prioridade?: number;
}

/** Uma temporada de série (estrutura vinda do TMDB). */
export interface TvSeason {
  season_number: number;
  name: string;
  episode_count: number;
}

/** Estatísticas agregadas da biblioteca (usadas no Dashboard). */
export interface Stats {
  total: number;
  movies: number;
  shows: number;
  watched: number;
  inProgress: number;
  unwatched: number;
  watchedPercent: number;
  avgRating: string;
  topGenres: { nome: string; qtd: number }[];
  decades: { dec: number; qtd: number }[];
  byType: { id: string; label: string; emoji: string; qtd: number }[];
  tempoAssistidoMin: number;
}

/** Uma lista compartilhada (família/amigos). */
export interface SharedList {
  id: string;
  nome: string;
  ownerUid: string;
  ownerEmail: string;
  memberEmails: string[];
}

/** Preferências aprendidas do que a pessoa gostou (para recomendação). */
export interface Preferences {
  genreWeight: Record<string, number>;
  tagWeight: Record<string, number>;
}

/** Resultado normalizado de uma busca no TMDB. */
export interface TmdbSearchResult {
  key: string;
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  tipo: Tipo;
  titulo: string;
  ano: number | null;
  generos: string[];
  poster_url: string;
  overview: string;
}

/** Detalhes ricos de um título (TMDB). */
export interface TmdbDetails {
  overview: string;
  runtime: number;
  num_temporadas: number;
  num_episodios: number;
  backdrop_url: string;
  elenco: CastMember[];
}

/** Um provedor de streaming/aluguel/compra. */
export interface Provider {
  nome: string;
  logo_url: string;
}

/** Onde assistir, agrupado por forma de acesso. */
export interface WatchProviders {
  link: string;
  flatrate: Provider[];
  rent: Provider[];
  buy: Provider[];
}
