// Catálogo de tipos de conteúdo e utilitários relacionados.
import type { Tipo } from '../types';

export interface ContentType {
  id: Tipo;
  label: string;
  emoji: string;
  serial: boolean; // tem temporadas/episódios?
}

// Tipos de conteúdo suportados. `serial: true` = tem temporadas/episódios.
export const TYPES: ContentType[] = [
  { id: 'movie',       label: 'Filme',               emoji: '🎬', serial: false },
  { id: 'series',      label: 'Série',               emoji: '📺', serial: true  },
  { id: 'anime',       label: 'Anime',               emoji: '🍥', serial: true  },
  { id: 'documentary', label: 'Documentário',        emoji: '🎥', serial: false },
  { id: 'miniseries',  label: 'Minissérie',          emoji: '📼', serial: true  },
  { id: 'tvshow',      label: 'Programa de TV',      emoji: '🎙️', serial: true  },
  { id: 'standup',     label: 'Stand-up / Especial', emoji: '🎤', serial: false },
];

export const TYPE_MAP: Record<string, ContentType> = Object.fromEntries(
  TYPES.map((t) => [t.id, t])
);

export const typeLabel = (id: string): string => TYPE_MAP[id]?.label || 'Filme';
export const typeEmoji = (id: string): string => TYPE_MAP[id]?.emoji || '🎬';
export const isSerial = (id: string): boolean => Boolean(TYPE_MAP[id]?.serial);

// Imagem de reserva quando não há pôster.
export const POSTER_FALLBACK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='150' viewBox='0 0 100 150'><rect width='100' height='150' fill='%231e293b'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2364748b' font-size='10' font-family='sans-serif'>Sem Imagem</text></svg>";
