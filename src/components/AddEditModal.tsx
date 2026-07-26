// Modal de Adicionar / Editar / Importar / Buscar (TMDB).
import type { Dispatch, SetStateAction, RefObject, FormEvent, ChangeEvent } from 'react';
import type { Item, Tipo, Status, TmdbSearchResult } from '../types';
import { TYPES, POSTER_FALLBACK, isSerial, typeEmoji, typeLabel } from '../lib/contentTypes';
import { setTmdbKey } from '../lib/tmdb';
import StarRating from './StarRating';

interface AddEditModalProps {
  editingItem: Item | null;
  modalMode: string;
  setModalMode: Dispatch<SetStateAction<string>>;
  hasTmdbKey: boolean;
  setHasTmdbKey: Dispatch<SetStateAction<boolean>>;
  keyIsFromEnv: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  allTags: string[];
  formTitulo: string;
  setFormTitulo: Dispatch<SetStateAction<string>>;
  formTipo: Tipo;
  setFormTipo: Dispatch<SetStateAction<Tipo>>;
  formAno: number | string;
  setFormAno: Dispatch<SetStateAction<number | string>>;
  formGeneros: string;
  setFormGeneros: Dispatch<SetStateAction<string>>;
  formPosterUrl: string;
  setFormPosterUrl: Dispatch<SetStateAction<string>>;
  formStatusAssistido: Status;
  setFormStatusAssistido: Dispatch<SetStateAction<Status>>;
  formProgresso: number | string;
  setFormProgresso: Dispatch<SetStateAction<number | string>>;
  formTemporadas: number | string;
  setFormTemporadas: Dispatch<SetStateAction<number | string>>;
  formTemporadaAtual: number | string;
  setFormTemporadaAtual: Dispatch<SetStateAction<number | string>>;
  formEpisodioAtual: number | string;
  setFormEpisodioAtual: Dispatch<SetStateAction<number | string>>;
  formNota: number;
  setFormNota: Dispatch<SetStateAction<number>>;
  formNotasPessoais: string;
  setFormNotasPessoais: Dispatch<SetStateAction<string>>;
  formTags: string[];
  tagInput: string;
  setTagInput: Dispatch<SetStateAction<string>>;
  tmdbQuery: string;
  setTmdbQuery: Dispatch<SetStateAction<string>>;
  tmdbResults: TmdbSearchResult[];
  tmdbLoading: boolean;
  tmdbError: string;
  tmdbSearched: boolean;
  tmdbKeyInput: string;
  setTmdbKeyInput: Dispatch<SetStateAction<string>>;
  setTmdbResults: Dispatch<SetStateAction<TmdbSearchResult[]>>;
  setTmdbSearched: Dispatch<SetStateAction<boolean>>;
  setShowTmdbHelp: Dispatch<SetStateAction<boolean>>;
  handleSaveForm: (e: FormEvent) => void;
  handleJsonImport: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSaveTmdbKey: () => void;
  handleTmdbSearch: (e?: FormEvent) => void;
  handlePickTmdb: (r: TmdbSearchResult) => void;
  addFormTag: (raw: string) => void;
  removeFormTag: (label: string) => void;
  onClose: () => void;
}

export default function AddEditModal(props: AddEditModalProps) {
  const {
    editingItem,
    modalMode,
    setModalMode,
    hasTmdbKey,
    setHasTmdbKey,
    keyIsFromEnv,
    fileInputRef,
    allTags,
    formTitulo,
    setFormTitulo,
    formTipo,
    setFormTipo,
    formAno,
    setFormAno,
    formGeneros,
    setFormGeneros,
    formPosterUrl,
    setFormPosterUrl,
    formStatusAssistido,
    setFormStatusAssistido,
    formProgresso,
    setFormProgresso,
    formTemporadas,
    setFormTemporadas,
    formTemporadaAtual,
    setFormTemporadaAtual,
    formEpisodioAtual,
    setFormEpisodioAtual,
    formNota,
    setFormNota,
    formNotasPessoais,
    setFormNotasPessoais,
    formTags,
    tagInput,
    setTagInput,
    tmdbQuery,
    setTmdbQuery,
    tmdbResults,
    tmdbLoading,
    tmdbError,
    tmdbSearched,
    tmdbKeyInput,
    setTmdbKeyInput,
    setTmdbResults,
    setTmdbSearched,
    setShowTmdbHelp,
    handleSaveForm,
    handleJsonImport,
    handleSaveTmdbKey,
    handleTmdbSearch,
    handlePickTmdb,
    addFormTag,
    removeFormTag,
    onClose,
  } = props;

  return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative bg-slate-900 rounded-3xl border border-slate-800 max-w-md w-full p-6 shadow-2xl transition-all duration-300">
            
            {/* Abas do Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
              <div className="flex space-x-3 text-xs">
                {!editingItem && (
                  <button
                    type="button"
                    onClick={() => setModalMode('tmdb')}
                    className={`pb-1 font-bold tracking-wider uppercase border-b-2 transition-all ${
                      modalMode === 'tmdb' ? 'border-purple-500 text-white' : 'border-transparent text-slate-500'
                    }`}
                  >
                    🔎 Buscar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setModalMode('manual')}
                  className={`pb-1 font-bold tracking-wider uppercase border-b-2 transition-all ${
                    modalMode === 'manual' ? 'border-purple-500 text-white' : 'border-transparent text-slate-500'
                  }`}
                >
                  {editingItem ? '✏️ Detalhes' : '🍿 Manual'}
                </button>
                {!editingItem && (
                  <button
                    type="button"
                    onClick={() => setModalMode('import')}
                    className={`pb-1 font-bold tracking-wider uppercase border-b-2 transition-all ${
                      modalMode === 'import' ? 'border-purple-500 text-white' : 'border-transparent text-slate-500'
                    }`}
                  >
                    📥 Importar JSON
                  </button>
                )}
              </div>
              <button
                onClick={() => onClose()}
                className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 rounded-lg border border-slate-800"
              >
                ✕
              </button>
            </div>

            {/* SEÇÃO: BUSCA TMDB */}
            {modalMode === 'tmdb' ? (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setShowTmdbHelp(true)}
                  className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-purple-300 bg-purple-950/40 border border-purple-500/30 rounded-xl py-2 hover:bg-purple-950/60 transition-colors"
                >
                  <span>❓</span> Como criar a conta e obter a chave de API?
                </button>
                {!hasTmdbKey ? (
                  <div className="space-y-3 py-2">
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                      <p className="text-xs text-slate-300 font-semibold">Configure a sua chave TMDB (grátis)</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Crie uma chave em{' '}
                        <a
                          href="https://www.themoviedb.org/settings/api"
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-400 underline"
                        >
                          themoviedb.org
                        </a>{' '}
                        (API Key v3). Ela fica guardada apenas no seu navegador.
                      </p>
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          value={tmdbKeyInput}
                          onChange={(e) => setTmdbKeyInput(e.target.value)}
                          placeholder="Cole a sua API Key aqui"
                          className="flex-1 py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <button
                          type="button"
                          onClick={handleSaveTmdbKey}
                          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase rounded-xl transition-all"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <form onSubmit={handleTmdbSearch} className="flex gap-2">
                      <input
                        type="text"
                        value={tmdbQuery}
                        onChange={(e) => setTmdbQuery(e.target.value)}
                        placeholder="Pesquisar filme ou série..."
                        autoFocus
                        className="flex-1 py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <button
                        type="submit"
                        disabled={tmdbLoading}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-xs font-bold uppercase rounded-xl transition-all"
                      >
                        {tmdbLoading ? '...' : '🔎'}
                      </button>
                    </form>

                    {tmdbError && (
                      <p className="text-[11px] text-red-300 bg-red-950/40 border border-red-500/20 rounded-lg px-3 py-2">
                        {tmdbError}
                      </p>
                    )}

                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                      {tmdbResults.map((r) => (
                        <button
                          key={r.key}
                          type="button"
                          onClick={() => handlePickTmdb(r)}
                          className="w-full text-left flex gap-3 items-start p-2 bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 hover:border-purple-500/40 rounded-xl transition-all"
                        >
                          <img
                            src={r.poster_url || POSTER_FALLBACK}
                            alt={r.titulo}
                            className="w-12 h-16 object-cover rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = POSTER_FALLBACK;
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded uppercase font-bold">
                                {typeEmoji(r.tipo)} {typeLabel(r.tipo)}
                              </span>
                              <span className="text-[10px] text-slate-500 font-bold">{r.ano || 's/ ano'}</span>
                            </div>
                            <p className="text-xs font-bold text-white truncate mt-0.5">{r.titulo}</p>
                            {r.generos.length > 0 && (
                              <p className="text-[10px] text-slate-500 truncate">{r.generos.join(', ')}</p>
                            )}
                          </div>
                        </button>
                      ))}
                      {tmdbSearched && !tmdbLoading && tmdbResults.length === 0 && !tmdbError && (
                        <p className="text-xs text-slate-500 text-center py-6">Nenhum resultado.</p>
                      )}
                    </div>

                    {!keyIsFromEnv && (
                      <button
                        type="button"
                        onClick={() => { setTmdbKey(''); setHasTmdbKey(false); setTmdbResults([]); setTmdbSearched(false); }}
                        className="text-[10px] text-slate-500 hover:text-slate-300 underline"
                      >
                        Alterar chave TMDB
                      </button>
                    )}
                  </>
                )}
              </div>
            ) : modalMode === 'import' ? (
              <div className="space-y-4 py-4 text-center">
                <div className="border-2 border-dashed border-slate-800 p-6 rounded-2xl bg-slate-950/40">
                  <svg className="w-10 h-10 text-purple-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-xs text-slate-300 font-semibold">Selecione o ficheiro de biblioteca `.json`</p>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleJsonImport}
                    accept=".json"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                  >
                    Procurar Ficheiro
                  </button>
                </div>
              </div>
            ) : (
              /* SEÇÃO: CADASTRO MANUAL */
              <form onSubmit={handleSaveForm} className="space-y-3.5">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Título Oficial</label>
                  <input
                    type="text"
                    required
                    value={formTitulo}
                    onChange={(e) => setFormTitulo(e.target.value)}
                    placeholder="Ex: Gladiator II..."
                    className="block w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Tipo</label>
                    <select
                      value={formTipo}
                      onChange={(e) => setFormTipo(e.target.value as Tipo)}
                      className="block w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    >
                      {TYPES.map(t => (
                        <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Ano</label>
                    <input
                      type="number"
                      required
                      value={formAno}
                      onChange={(e) => setFormAno(e.target.value)}
                      className="block w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Géneros (separados por vírgula)</label>
                  <input
                    type="text"
                    value={formGeneros}
                    onChange={(e) => setFormGeneros(e.target.value)}
                    placeholder="Ex: Ação, Drama, Sci-Fi"
                    className="block w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-700 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Link para o Pôster (Capa)</label>
                  <input
                    type="url"
                    value={formPosterUrl}
                    onChange={(e) => setFormPosterUrl(e.target.value)}
                    placeholder="Ex: https://imagens-poster.com/img.jpg"
                    className="block w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-700 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Estado de Visualização</label>
                    <select
                      value={formStatusAssistido}
                      onChange={(e) => setFormStatusAssistido(e.target.value as Status)}
                      className="block w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    >
                      <option value="nao_assistido">⏳ Pendente</option>
                      <option value="em_andamento">🍿 Em Curso</option>
                      <option value="assistido">✓ Assistido</option>
                    </select>
                  </div>

                  {!isSerial(formTipo) ? (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Progresso (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        disabled={formStatusAssistido !== 'em_andamento'}
                        value={formStatusAssistido === 'em_andamento' ? formProgresso : (formStatusAssistido === 'assistido' ? 100 : 0)}
                        onChange={(e) => setFormProgresso(e.target.value)}
                        className="block w-full py-2 px-3 bg-slate-950 disabled:bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Temp. Assistidas</label>
                      <input
                        type="number"
                        min="0"
                        value={formTemporadas}
                        onChange={(e) => setFormTemporadas(e.target.value)}
                        className="block w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Episódio atual — apenas para conteúdos seriados em curso */}
                {isSerial(formTipo) && formStatusAssistido === 'em_andamento' && (
                  <div className="grid grid-cols-2 gap-3 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Temporada atual</label>
                      <input
                        type="number"
                        min="1"
                        value={formTemporadaAtual}
                        onChange={(e) => setFormTemporadaAtual(e.target.value)}
                        className="block w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Episódio atual</label>
                      <input
                        type="number"
                        min="1"
                        value={formEpisodioAtual}
                        onChange={(e) => setFormEpisodioAtual(e.target.value)}
                        className="block w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block text-center">Classificação ({formNota} estrelas)</label>
                  <div className="flex items-center justify-center space-x-1.5 bg-slate-950 py-1.5 rounded-xl border border-slate-800">
                    <StarRating value={formNota} onRate={setFormNota} sizeClass="w-6 h-6" strongGlow />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Tags</label>
                  {/* Tags já adicionadas */}
                  {formTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      {formTags.map(t => (
                        <span key={t} className="flex items-center gap-1 bg-purple-950/70 text-purple-200 text-[10px] font-bold px-2 py-1 rounded-lg border border-purple-500/30">
                          {t}
                          <button
                            type="button"
                            onClick={() => removeFormTag(t)}
                            aria-label={`Remover tag ${t}`}
                            className="text-purple-300 hover:text-white leading-none"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        addFormTag(tagInput);
                      }
                    }}
                    placeholder="Digite uma tag e Enter (ex: Família, Oliver, Domingo)"
                    className="block w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  {/* Sugestões: tags existentes ainda não adicionadas */}
                  {allTags.filter(t => !formTags.some(f => f.toLowerCase() === t.toLowerCase())).length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1.5">
                      {allTags
                        .filter(t => !formTags.some(f => f.toLowerCase() === t.toLowerCase()))
                        .slice(0, 12)
                        .map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => addFormTag(t)}
                            className="text-[10px] text-slate-400 hover:text-purple-300 bg-slate-950 border border-slate-800 hover:border-purple-500/40 px-2 py-0.5 rounded-lg transition-colors"
                          >
                            + {t}
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Anotações Pessoais</label>
                  <textarea
                    value={formNotasPessoais}
                    onChange={(e) => setFormNotasPessoais(e.target.value)}
                    placeholder="Onde assistir, ideias, anotações..."
                    rows={2}
                    className="block w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-700 text-xs focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => onClose()}
                    className="px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                  >
                    Guardar
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
  );
}
