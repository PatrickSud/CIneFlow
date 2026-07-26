// Tipos do ambiente Vite (variáveis de ambiente expostas ao cliente).
interface ImportMetaEnv {
  readonly VITE_TMDB_KEY?: string;
  readonly BASE_URL: string;
  readonly [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
