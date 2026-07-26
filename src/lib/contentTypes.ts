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

// Níveis de prioridade da watchlist (0 = nenhuma … 3 = alta).
export interface PriorityLevel {
  v: number;
  label: string;
  dot: string;
  badge: string; // classes do "chip" visível no card
  chip: string;  // classes do botão selecionado no seletor
}
export const PRIORITIES: PriorityLevel[] = [
  { v: 0, label: 'Nenhuma', dot: '⚪', badge: '', chip: 'bg-slate-700 text-white border-slate-600' },
  { v: 1, label: 'Baixa',   dot: '🔵', badge: 'bg-blue-950/60 text-blue-300 border-blue-500/25',   chip: 'bg-blue-600 text-white border-blue-500' },
  { v: 2, label: 'Média',   dot: '🟡', badge: 'bg-amber-950/60 text-amber-300 border-amber-500/25', chip: 'bg-amber-600 text-white border-amber-500' },
  { v: 3, label: 'Alta',    dot: '🔴', badge: 'bg-red-950/60 text-red-300 border-red-500/25',       chip: 'bg-red-600 text-white border-red-500' },
];
export const priorityInfo = (v?: number): PriorityLevel => PRIORITIES[Math.max(0, Math.min(3, v || 0))];

// Imagem de reserva quando não há pôster.
export const POSTER_FALLBACK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='150' viewBox='0 0 100 150'><rect width='100' height='150' fill='%231e293b'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2364748b' font-size='10' font-family='sans-serif'>Sem Imagem</text></svg>";
