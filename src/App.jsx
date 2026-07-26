import React, { useState, useEffect, useMemo, useRef } from 'react';
import { INITIAL_DATABASE } from './data/initialDatabase';
import { searchTmdb, getTmdbKey, setTmdbKey, keyIsFromEnv } from './lib/tmdb';

const POSTER_FALLBACK = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='150' viewBox='0 0 100 150'><rect width='100' height='150' fill='%231e293b'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2364748b' font-size='10' font-family='sans-serif'>Sem Imagem</text></svg>";

const STORAGE_KEY = 'cineflow_extended_db_v3';

// Gera IDs únicos e robustos (evita colisões de Date.now() em criações rápidas)
const genId = (prefix = 'custom') =>
  (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? `${prefix}-${crypto.randomUUID()}`
    : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function App() {
  const fileInputRef = useRef(null);

  // --- Estado da Aplicação ---
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Erro ao carregar dados salvos. Usando padrão.");
      }
    }
    return INITIAL_DATABASE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Não foi possível salvar no localStorage.", e);
    }
  }, [items]);

  const [activeTab, setActiveTab] = useState('lista');

  // Filtros da Lista
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); 
  const [filterStatus, setFilterStatus] = useState('all'); 
  const [sortBy, setSortBy] = useState('title-asc'); 

  // Modal de Adicionar / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('manual'); // manual | import
  const [editingItem, setEditingItem] = useState(null);

  // Campos do Formulário Manual
  const [formTitulo, setFormTitulo] = useState('');
  const [formTipo, setFormTipo] = useState('movie');
  const [formAno, setFormAno] = useState(new Date().getFullYear());
  const [formGeneros, setFormGeneros] = useState('');
  const [formPosterUrl, setFormPosterUrl] = useState('');
  const [formStatusAssistido, setFormStatusAssistido] = useState('nao_assistido');
  const [formProgresso, setFormProgresso] = useState(0);
  const [formTemporadas, setFormTemporadas] = useState(0);
  const [formTemporadaAtual, setFormTemporadaAtual] = useState(1);
  const [formEpisodioAtual, setFormEpisodioAtual] = useState(1);
  const [formNota, setFormNota] = useState(0);
  const [formNotasPessoais, setFormNotasPessoais] = useState('');

  // Busca TMDB (preenchimento automático de metadados)
  const [tmdbQuery, setTmdbQuery] = useState('');
  const [tmdbResults, setTmdbResults] = useState([]);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [tmdbError, setTmdbError] = useState('');
  const [tmdbSearched, setTmdbSearched] = useState(false);
  const [tmdbKeyInput, setTmdbKeyInput] = useState('');
  const [hasTmdbKey, setHasTmdbKey] = useState(() => Boolean(getTmdbKey()));

  // Sorteador (CineMatch)
  const [matchType, setMatchType] = useState('all'); 
  const [matchStatus, setMatchStatus] = useState('nao_assistido'); 
  const [matchMinRating, setMatchMinRating] = useState(0); 
  const [matchCount, setMatchCount] = useState(3);
  const [matchedItems, setMatchedItems] = useState([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [matchMessage, setMatchMessage] = useState('');

  // Notificações (Toast)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // --- Funções do Formulário ---
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormTitulo('');
    setFormTipo('movie');
    setFormAno(new Date().getFullYear());
    setFormGeneros('');
    setFormPosterUrl('');
    setFormStatusAssistido('nao_assistido');
    setFormProgresso(0);
    setFormTemporadas(0);
    setFormTemporadaAtual(1);
    setFormEpisodioAtual(1);
    setFormNota(0);
    setFormNotasPessoais('');
    setTmdbQuery('');
    setTmdbResults([]);
    setTmdbError('');
    setTmdbSearched(false);
    setModalMode(hasTmdbKey ? 'tmdb' : 'manual');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormTitulo(item.titulo);
    setFormTipo(item.tipo);
    setFormAno(item.ano || new Date().getFullYear());
    setFormGeneros(Array.isArray(item.generos) ? item.generos.join(', ') : '');
    setFormPosterUrl(item.poster_url || '');
    setFormStatusAssistido(item.status_assistido || 'nao_assistido');
    setFormProgresso(item.progresso_porcentagem || 0);
    setFormTemporadas(item.temporadas_assistidas_max || 0);
    setFormTemporadaAtual(item.temporada_atual || 1);
    setFormEpisodioAtual(item.episodio_atual || 1);
    setFormNota(item.nota || 0);
    setFormNotasPessoais(item.notas_pessoais || '');
    setModalMode('manual');
    setIsModalOpen(true);
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!formTitulo.trim()) {
      showToast('Por favor, introduza um título!', 'error');
      return;
    }

    const generosArray = formGeneros
      ? formGeneros.split(',').map(g => g.trim()).filter(Boolean)
      : [];

    let finalProgresso = formProgresso;
    if (formStatusAssistido === 'assistido') finalProgresso = 100;
    if (formStatusAssistido === 'nao_assistido') finalProgresso = 0;

    const recordData = {
      titulo: formTitulo.trim(),
      tipo: formTipo,
      ano: Number(formAno),
      generos: generosArray,
      poster_url: formPosterUrl.trim(),
      status_assistido: formStatusAssistido,
      progresso_porcentagem: Number(finalProgresso),
      temporadas_assistidas_max: formTipo === 'series' ? Number(formTemporadas) : 0,
      temporada_atual: formTipo === 'series' && formStatusAssistido === 'em_andamento' ? Number(formTemporadaAtual) : 0,
      episodio_atual: formTipo === 'series' && formStatusAssistido === 'em_andamento' ? Number(formEpisodioAtual) : 0,
      nota: Number(formNota),
      notas_pessoais: formNotasPessoais.trim()
    };

    if (editingItem) {
      setItems(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...recordData } : item));
      showToast('Título atualizado com sucesso!');
    } else {
      const newItem = {
        id: genId('custom'),
        ...recordData,
        data_adicao: new Date().toISOString()
      };
      setItems(prev => [newItem, ...prev]);
      showToast('Novo título adicionado com sucesso!');
    }
    setIsModalOpen(false);
  };

  // --- Importar Ficheiro JSON ---
  const handleJsonImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const rawList = parsed.biblioteca || (Array.isArray(parsed) ? parsed : null);

        if (!rawList || !Array.isArray(rawList)) {
          showToast('Formato JSON incompatível. Certifique-se de que possui uma lista válida.', 'error');
          return;
        }

        setItems(prev => {
          const currentMap = new Map(prev.map(item => [item.id, item]));

          rawList.forEach((raw, idx) => {
            const id = raw.id || genId('imported');
            let status = raw.status_assistido || 'nao_assistido';
            let progresso = raw.progresso_porcentagem !== undefined ? Number(raw.progresso_porcentagem) : 0;
            if (status === 'assistido') progresso = 100;

            currentMap.set(id, {
              id,
              titulo: raw.titulo || raw.title || 'Título Desconhecido',
              tipo: raw.tipo || raw.type || 'movie',
              ano: Number(raw.ano || raw.year || new Date().getFullYear()),
              generos: Array.isArray(raw.generos) ? raw.generos : [],
              data_adicao: raw.data_adicao || raw.dateAdded || new Date().toISOString(),
              poster_url: raw.poster_url || raw.poster || '',
              status_assistido: status,
              progresso_porcentagem: progresso,
              temporadas_assistidas_max: Number(raw.temporadas_assistidas_max || 0),
              nota: Number(raw.nota || raw.rating || 0),
              notas_pessoais: raw.notas_pessoais || raw.notes || ''
            });
          });

          return Array.from(currentMap.values());
        });

        showToast(`${rawList.length} registos integrados com sucesso!`);
        setIsModalOpen(false);
      } catch (err) {
        showToast('Falha ao processar o ficheiro JSON.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // permite reimportar o mesmo ficheiro
  };

  // --- Exportar Biblioteca (backup) ---
  const handleExport = () => {
    try {
      const payload = { versao: 3, exportado_em: new Date().toISOString(), biblioteca: items };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cineflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Backup exportado com sucesso!');
    } catch (e) {
      showToast('Falha ao exportar a biblioteca.', 'error');
    }
  };

  // --- Busca TMDB ---
  const handleSaveTmdbKey = () => {
    const k = tmdbKeyInput.trim();
    if (!k) return;
    setTmdbKey(k);
    setHasTmdbKey(true);
    setTmdbKeyInput('');
    showToast('Chave TMDB guardada!');
  };

  const handleTmdbSearch = async (e) => {
    if (e) e.preventDefault();
    const q = tmdbQuery.trim();
    if (!q) return;
    setTmdbLoading(true);
    setTmdbError('');
    setTmdbResults([]);
    setTmdbSearched(true);
    try {
      const results = await searchTmdb(q);
      setTmdbResults(results);
      if (results.length === 0) setTmdbError('Nenhum resultado encontrado no TMDB.');
    } catch (err) {
      if (err.code === 'NO_KEY') {
        setHasTmdbKey(false);
        setTmdbError('Configure a sua chave TMDB para pesquisar.');
      } else if (err.code === 'BAD_KEY') {
        setTmdbError('Chave TMDB inválida. Verifique e tente novamente.');
      } else {
        setTmdbError('Não foi possível pesquisar agora. Verifique a sua ligação.');
      }
    } finally {
      setTmdbLoading(false);
    }
  };

  // Preenche o formulário manual com um resultado do TMDB (para revisão antes de guardar)
  const handlePickTmdb = (r) => {
    setEditingItem(null);
    setFormTitulo(r.titulo);
    setFormTipo(r.tipo);
    setFormAno(r.ano || new Date().getFullYear());
    setFormGeneros(Array.isArray(r.generos) ? r.generos.join(', ') : '');
    setFormPosterUrl(r.poster_url || '');
    setFormStatusAssistido('nao_assistido');
    setFormProgresso(0);
    setFormTemporadas(0);
    setFormTemporadaAtual(1);
    setFormEpisodioAtual(1);
    setFormNota(0);
    setFormNotasPessoais('');
    setModalMode('manual');
    showToast('Dados preenchidos — revise e guarde.', 'info');
  };

  // Deletar Item
  const handleDeleteItem = (id, titulo) => {
    if (confirm(`Pretende remover "${titulo}" da sua biblioteca?`)) {
      setItems(prev => prev.filter(item => item.id !== id));
      setMatchedItems(prev => prev.filter(item => item.id !== id));
      showToast('Registo excluído com sucesso!', 'info');
    }
  };

  // Alteração Rápida de Status
  const handleToggleWatchedQuickly = (id) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const isCurrentlyWatched = item.status_assistido === 'assistido';
        const nextStatus = isCurrentlyWatched ? 'nao_assistido' : 'assistido';
        const nextProgress = isCurrentlyWatched ? 0 : 100;
        showToast(`Marcado como ${isCurrentlyWatched ? 'Não assistido' : 'Assistido'}`);
        return {
          ...item,
          status_assistido: nextStatus,
          progresso_porcentagem: nextProgress
        };
      }
      return item;
    }));
  };

  // Classificação Rápida
  const handleRateQuickly = (id, ratingValue) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        showToast(`Nota de ${ratingValue} estrelas guardada!`);
        return { ...item, nota: ratingValue };
      }
      return item;
    }));
  };

  // --- Filtros ---
  const processedItems = useMemo(() => {
    return items
      .filter(item => {
        const q = searchQuery.trim().toLowerCase();
        const titleMatch = item.titulo.toLowerCase().includes(q);
        const notesMatch = item.notas_pessoais && item.notas_pessoais.toLowerCase().includes(q);
        const genreMatch = Array.isArray(item.generos) &&
          item.generos.some(g => g.toLowerCase().includes(q));
        const matchesSearch = q === '' || titleMatch || notesMatch || genreMatch;

        const matchesType = filterType === 'all' || item.tipo === filterType;

        let matchesStatus = true;
        if (filterStatus !== 'all') {
          matchesStatus = item.status_assistido === filterStatus;
        }

        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'title-asc') return a.titulo.localeCompare(b.titulo);
        if (sortBy === 'title-desc') return b.titulo.localeCompare(a.titulo);
        if (sortBy === 'rating-desc') return b.nota - a.nota;
        if (sortBy === 'newest') return new Date(b.data_adicao) - new Date(a.data_adicao);
        if (sortBy === 'ano-desc') return b.ano - a.ano;
        return 0;
      });
  }, [items, searchQuery, filterType, filterStatus, sortBy]);

  // --- Estatísticas ---
  const stats = useMemo(() => {
    const total = items.length;
    const movies = items.filter(i => i.tipo === 'movie').length;
    const shows = items.filter(i => i.tipo === 'series').length;
    const watched = items.filter(i => i.status_assistido === 'assistido').length;
    const inProgress = items.filter(i => i.status_assistido === 'em_andamento').length;
    const unwatched = items.filter(i => i.status_assistido === 'nao_assistido').length;
    const watchedPercent = total > 0 ? Math.round((watched / total) * 100) : 0;
    
    const ratedItems = items.filter(i => i.nota > 0);
    const avgRating = ratedItems.length > 0
      ? (ratedItems.reduce((acc, i) => acc + i.nota, 0) / ratedItems.length).toFixed(1)
      : '0.0';

    // Distribuição por gênero (top 8)
    const genreCount = {};
    items.forEach(i => {
      if (Array.isArray(i.generos)) {
        i.generos.forEach(g => {
          const name = (g || '').trim();
          if (name) genreCount[name] = (genreCount[name] || 0) + 1;
        });
      }
    });
    const topGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([nome, qtd]) => ({ nome, qtd }));

    // Distribuição por década
    const decadeCount = {};
    items.forEach(i => {
      const ano = Number(i.ano);
      if (ano && !Number.isNaN(ano)) {
        const dec = Math.floor(ano / 10) * 10;
        decadeCount[dec] = (decadeCount[dec] || 0) + 1;
      }
    });
    const decades = Object.entries(decadeCount)
      .map(([dec, qtd]) => ({ dec: Number(dec), qtd }))
      .sort((a, b) => a.dec - b.dec);

    return { total, movies, shows, watched, inProgress, unwatched, watchedPercent, avgRating, topGenres, decades };
  }, [items]);

  // --- CineMatch ---
  const handleCineMatch = () => {
    setIsShuffling(true);
    setMatchedItems([]);
    setMatchMessage('');

    setTimeout(() => {
      const pool = items.filter(item => {
        const matchT = matchType === 'all' || item.tipo === matchType;
        const matchS = matchStatus === 'all' || item.status_assistido === matchStatus;
        const matchR = item.nota >= matchMinRating;
        return matchT && matchS && matchR;
      });

      if (pool.length === 0) {
        setMatchedItems([]);
        setMatchMessage('Nenhum título encontrado com esses critérios de busca.');
        setIsShuffling(false);
        return;
      }

      // Embaralhamento Fisher-Yates (distribuição uniforme, sem viés)
      const shuffled = [...pool];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      const selected = shuffled.slice(0, Math.min(matchCount, shuffled.length));

      setMatchedItems(selected);
      setIsShuffling(false);
      showToast('Seleção CineMatch realizada!');
    }, 1100);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-600 pb-24">
      
      {/* Header Estável */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/85">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/10">
              <svg className="w-5.5 h-5.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent uppercase">
                CineFlow
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">A Minha Biblioteca</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExport}
              aria-label="Exportar biblioteca (backup JSON)"
              title="Exportar biblioteca (backup JSON)"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-700 flex items-center space-x-1.5 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
              </svg>
              <span className="hidden sm:inline">Backup</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg flex items-center space-x-1.5 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Novo Título / Importar</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ==================== TAB: LISTA ==================== */}
        {activeTab === 'lista' && (
          <section className="space-y-6">
            
            {/* Bloco de Busca Avançada */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800/80 shadow-xl space-y-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Pesquisar por título, notas ou género..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all text-sm"
                />
              </div>

              {/* Grid Filtros Rápidos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/50">
                
                {/* Categoria */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Categoria</label>
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setFilterType('all')}
                      className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                        filterType === 'all' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Tudo
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterType('movie')}
                      className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                        filterType === 'movie' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Filmes
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterType('series')}
                      className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                        filterType === 'series' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Séries/Animes
                    </button>
                  </div>
                </div>

                {/* Status Assistido */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Estado de Visualização</label>
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setFilterStatus('all')}
                      className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                        filterStatus === 'all' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterStatus('nao_assistido')}
                      className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                        filterStatus === 'nao_assistido' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Pendentes
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterStatus('em_andamento')}
                      className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                        filterStatus === 'em_andamento' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Em Curso
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterStatus('assistido')}
                      className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                        filterStatus === 'assistido' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Vistos
                    </button>
                  </div>
                </div>

                {/* Ordenação */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Ordenar Por</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="block w-full py-1.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="title-asc">Título (A-Z)</option>
                    <option value="title-desc">Título (Z-A)</option>
                    <option value="rating-desc">Melhor Classificação</option>
                    <option value="ano-desc">Mais Recentes (Lançamento)</option>
                    <option value="newest">Adicionados Recentemente</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Cabeçalho de Resultados */}
            <div className="flex items-center justify-between px-2 text-xs">
              <span className="font-semibold text-slate-400">
                A exibir <strong className="text-white">{processedItems.length}</strong> de {items.length} registados
              </span>
              {(searchQuery || filterType !== 'all' || filterStatus !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('all');
                    setFilterStatus('all');
                  }}
                  className="text-purple-400 hover:text-purple-300 font-bold underline"
                >
                  Limpar Filtros
                </button>
              )}
            </div>

            {/* Lista Grid */}
            {processedItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {processedItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-900/80 border border-slate-800/80 hover:border-purple-500/40 rounded-2xl overflow-hidden transition-all duration-300 shadow-lg flex flex-col justify-between group"
                  >
                    
                    {/* Header com Capa */}
                    <div className="flex items-start p-4 space-x-4">
                      {/* Imagem do Pôster */}
                      <div className="w-20 h-28 flex-shrink-0 bg-slate-950 rounded-xl overflow-hidden shadow-inner border border-slate-800 relative">
                        <img
                          src={item.poster_url || POSTER_FALLBACK}
                          alt={item.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = POSTER_FALLBACK;
                          }}
                        />
                        {/* Selo Tipo */}
                        <div className="absolute top-1 left-1 bg-black/80 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase text-slate-300">
                          {item.tipo === 'movie' ? 'Filme' : 'Série'}
                        </div>
                      </div>

                      {/* Info do Card */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold text-slate-400">{item.ano || 'N/A'}</span>
                          
                          {/* Estado Badge */}
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide uppercase ${
                            item.status_assistido === 'assistido' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/20' :
                            item.status_assistido === 'em_andamento' ? 'bg-blue-950/80 text-blue-300 border border-blue-500/20' :
                            'bg-slate-950/80 text-slate-400 border border-slate-800'
                          }`}>
                            {item.status_assistido === 'assistido' ? 'Assistido' :
                             item.status_assistido === 'em_andamento' ? 'Em Curso' :
                             'Pendente'}
                          </span>
                        </div>

                        <h3 className="font-bold text-sm text-white leading-tight truncate group-hover:text-purple-300 transition-colors" title={item.titulo}>
                          {item.titulo}
                        </h3>

                        {/* Gêneros */}
                        {Array.isArray(item.generos) && item.generos.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.generos.slice(0, 3).map((gen, gIdx) => (
                              <span key={gIdx} className="bg-slate-950 text-[9px] px-1.5 py-0.5 rounded text-slate-400">
                                {gen}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-600 italic">Sem géneros</span>
                        )}

                        {/* Barra de Progresso / Temporadas */}
                        {item.status_assistido === 'em_andamento' && item.progresso_porcentagem > 0 && (
                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between items-center text-[9px] font-bold text-blue-400">
                              <span>Progresso</span>
                              <span>{item.progresso_porcentagem}%</span>
                            </div>
                            <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${item.progresso_porcentagem}%` }}></div>
                            </div>
                          </div>
                        )}

                        {item.tipo === 'series' && item.status_assistido === 'em_andamento' && (item.temporada_atual > 0 || item.episodio_atual > 0) && (
                          <div className="pt-1.5 flex items-center space-x-1">
                            <span className="text-[10px] bg-blue-950/60 text-blue-300 px-1.5 py-0.5 rounded font-bold border border-blue-900/40">
                              📺 T{item.temporada_atual || 1} · E{item.episodio_atual || 1}
                            </span>
                          </div>
                        )}

                        {item.tipo === 'series' && item.status_assistido !== 'em_andamento' && item.temporadas_assistidas_max > 0 && (
                          <div className="pt-1.5 flex items-center space-x-1">
                            <span className="text-[10px] bg-indigo-950/60 text-indigo-300 px-1.5 py-0.5 rounded font-bold border border-indigo-900/30">
                              📺 {item.temporadas_assistidas_max} {item.temporadas_assistidas_max === 1 ? 'Temp.' : 'Temps.'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notas Pessoais */}
                    {item.notas_pessoais && (
                      <p className="mx-4 mb-3 text-[10px] text-slate-400 bg-slate-950/50 p-2 rounded-lg italic line-clamp-2 border border-slate-850">
                        "{item.notas_pessoais}"
                      </p>
                    )}

                    {/* Footer do Card */}
                    <div className="px-4 py-3 bg-slate-900/40 border-t border-slate-800/80 flex items-center justify-between">
                      {/* Estrelas */}
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRateQuickly(item.id, star)}
                            aria-label={`Classificar com ${star} ${star === 1 ? 'estrela' : 'estrelas'}`}
                            title={`${star} ${star === 1 ? 'estrela' : 'estrelas'}`}
                            className="p-0.5 hover:scale-125 transition-transform"
                          >
                            <svg
                              className={`w-3.5 h-3.5 ${
                                star <= (item.nota || 0) 
                                  ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_2px_rgba(251,191,36,0.2)]' 
                                  : 'text-slate-700'
                              }`}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        ))}
                      </div>

                      {/* Opções */}
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleToggleWatchedQuickly(item.id)}
                          className={`p-1 border rounded-lg text-xs transition-colors ${
                            item.status_assistido === 'assistido' 
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-500/20' 
                              : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-white'
                          }`}
                          title="Alternar Visualização"
                          aria-label="Alternar estado assistido"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-purple-400 border border-slate-800 rounded-lg text-xs"
                          title="Editar Ficha"
                          aria-label="Editar ficha"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id, item.titulo)}
                          className="p-1 bg-slate-950 hover:bg-red-950/20 text-slate-600 hover:text-red-400 border border-slate-800 rounded-lg text-xs"
                          title="Remover"
                          aria-label="Remover título da biblioteca"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center max-w-md mx-auto">
                <p className="text-sm text-slate-400">Nenhum título encontrado com a filtragem atual.</p>
              </div>
            )}

          </section>
        )}

        {/* ==================== TAB: MATCH SORTEADOR ==================== */}
        {activeTab === 'sorteador' && (
          <section className="space-y-6 max-w-4xl mx-auto">
            
            <div className="bg-gradient-to-r from-purple-900/30 to-slate-900 p-6 rounded-2xl border border-purple-500/20 shadow-xl">
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center">
                <span className="mr-2">🎲</span> CineMatch
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Configure os parâmetros de preferência e descubra sugestões diretas da sua própria coleção!
              </p>
            </div>

            {/* Configuração do Sorteio */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-4 gap-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Categoria</label>
                <select
                  value={matchType}
                  onChange={(e) => setMatchType(e.target.value)}
                  className="w-full py-1.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="all">🍿 Qualquer Tipo</option>
                  <option value="movie">🎬 Filmes</option>
                  <option value="series">📺 Séries/Animes</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Estado de Visualização</label>
                <select
                  value={matchStatus}
                  onChange={(e) => setMatchStatus(e.target.value)}
                  className="w-full py-1.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="nao_assistido">⏳ Pendentes (Não assistidos)</option>
                  <option value="em_andamento">🍿 Em Curso</option>
                  <option value="assistido">🔄 Assistidos</option>
                  <option value="all">✨ Todos</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Avaliação Mínima</label>
                <select
                  value={matchMinRating}
                  onChange={(e) => setMatchMinRating(Number(e.target.value))}
                  className="w-full py-1.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="0">✨ Sem Nota Mínima</option>
                  <option value="3">⭐ Mínimo 3 Estrelas</option>
                  <option value="4">🌟 Mínimo 4 Estrelas</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Quantidade</label>
                <select
                  value={matchCount}
                  onChange={(e) => setMatchCount(Number(e.target.value))}
                  className="w-full py-1.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="1">1 sugestão</option>
                  <option value="3">3 sugestões</option>
                  <option value="5">5 sugestões</option>
                </select>
              </div>

            </div>

            <button
              onClick={handleCineMatch}
              disabled={isShuffling}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 disabled:opacity-60 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              {isShuffling ? "A escolher..." : "🎲 Sortear Sugestões"}
            </button>

            {/* Exibição das Indicações Sorteadas */}
            <div className="pt-4">
              {isShuffling ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-2">
                  <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-400">A processar...</p>
                </div>
              ) : matchedItems.length > 0 ? (
                <div className="space-y-5">
                  <h3 className="text-center font-bold text-xs text-slate-300 uppercase tracking-widest">Recomendações Ideais para Hoje:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {matchedItems.map(item => (
                      <div
                        key={item.id}
                        className="bg-slate-900 border-2 border-purple-500/30 p-4 rounded-2xl flex space-x-3 items-start relative overflow-hidden"
                      >
                        <img
                          src={item.poster_url || POSTER_FALLBACK}
                          alt={item.titulo}
                          className="w-16 h-24 object-cover rounded-lg bg-slate-950 border border-slate-800"
                        />
                        <div className="flex-1 space-y-1">
                          <span className="text-[9px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded uppercase font-bold">
                            {item.tipo === 'movie' ? '🎬 Filme' : '📺 Série'}
                          </span>
                          <h4 className="font-bold text-sm text-white leading-tight mt-1">{item.titulo}</h4>
                          <p className="text-[10px] text-slate-400">{item.ano}</p>
                          {item.nota > 0 && <span className="text-amber-400 text-xs">★ {item.nota}/5</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/60 p-12 text-center rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-400">
                    {matchMessage || 'Defina as configurações de filtragem e pressione "Sortear Sugestões".'}
                  </p>
                </div>
              )}
            </div>

          </section>
        )}

        {/* ==================== TAB: METRICAS E PROGRESSO ==================== */}
        {activeTab === 'dashboard' && (
          <section className="space-y-6 max-w-5xl mx-auto">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Acervo Geral</p>
                  <h3 className="text-2xl font-black text-white mt-1">{stats.total}</h3>
                </div>
                <div className="p-2.5 bg-purple-950/50 rounded-xl text-purple-400 text-sm">📁</div>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filmes / Séries</p>
                  <h3 className="text-xl font-black text-white mt-1">
                    {stats.movies} <span className="text-xs text-slate-500">Filmes</span> / {stats.shows} <span className="text-xs text-slate-500">Séries</span>
                  </h3>
                </div>
                <div className="p-2.5 bg-indigo-950/50 rounded-xl text-indigo-400 text-sm">🎬</div>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Concluídos</p>
                  <h3 className="text-2xl font-black text-emerald-400 mt-1">
                    {stats.watched} <span className="text-xs text-slate-500">({stats.watchedPercent}%)</span>
                  </h3>
                </div>
                <div className="p-2.5 bg-emerald-950/50 rounded-xl text-emerald-400 text-sm">✓</div>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Em Curso</p>
                  <h3 className="text-2xl font-black text-blue-400 mt-1">{stats.inProgress}</h3>
                </div>
                <div className="p-2.5 bg-blue-950/50 rounded-xl text-blue-400 text-sm">⏳</div>
              </div>

            </div>

            {/* Conclusão Geral */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300">Progresso de Visualização Total</span>
                <span className="text-purple-400 font-black">{stats.watched} de {stats.total} assistidos ({stats.watchedPercent}%)</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-850 p-0.5">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full transition-all duration-700" style={{ width: `${stats.watchedPercent}%` }}></div>
              </div>
            </div>

            {/* Nota média + Distribuições */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Distribuição por Gênero */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">🎭 Principais Géneros</h4>
                  <span className="text-[10px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-black">
                    Nota média ★ {stats.avgRating}
                  </span>
                </div>
                {stats.topGenres.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    {stats.topGenres.map(g => (
                      <div key={g.nome} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-300">{g.nome}</span>
                          <span className="text-slate-500">{g.qtd}</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                          <div
                            className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full transition-all duration-700"
                            style={{ width: `${(g.qtd / stats.topGenres[0].qtd) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Sem géneros registados ainda.</p>
                )}
              </div>

              {/* Distribuição por Década */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">📅 Por Década de Lançamento</h4>
                {stats.decades.length > 0 ? (
                  <div className="flex items-end justify-between gap-1.5 pt-3 h-40">
                    {stats.decades.map(d => {
                      const maxDec = Math.max(...stats.decades.map(x => x.qtd));
                      const h = Math.max(6, Math.round((d.qtd / maxDec) * 100));
                      return (
                        <div key={d.dec} className="flex-1 flex flex-col items-center justify-end h-full gap-1" title={`${d.qtd} título(s)`}>
                          <span className="text-[9px] font-bold text-slate-400">{d.qtd}</span>
                          <div
                            className="w-full bg-gradient-to-t from-purple-600 to-indigo-400 rounded-t-md transition-all duration-700"
                            style={{ height: `${h}%` }}
                          ></div>
                          <span className="text-[8px] font-bold text-slate-500">{`${String(d.dec).slice(2)}s`}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Sem anos registados ainda.</p>
                )}
              </div>

            </div>

            {/* Obras com Classificação de 5 Estrelas */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">⭐ Títulos de Excelência (Classificação Máxima)</h4>
              {items.filter(i => i.nota === 5).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {items.filter(i => i.nota === 5).map(item => (
                    <div key={item.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 truncate pr-2">{item.titulo}</span>
                      <span className="bg-amber-950 text-amber-400 text-[10px] px-2 py-0.5 rounded border border-amber-500/20 font-black">★ 5</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">Nenhum título com nota máxima atribuída por enquanto.</p>
              )}
            </div>

          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 text-center text-slate-500 text-xs mb-20">
        <p>🍿 CineFlow — Armazenamento seguro de dados locais.</p>
      </footer>

      {/* ==================== MENU FLUTUANTE INFERIOR COMPACTO E MINIMALISTA ==================== */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[85%] max-w-xs bg-slate-900/95 backdrop-blur-md border border-slate-800/80 rounded-full py-1.5 px-2 shadow-2xl flex justify-between items-center gap-1">
        <button
          onClick={() => setActiveTab('lista')}
          className={`flex-1 py-1.5 px-2.5 rounded-full flex items-center justify-center space-x-1.5 text-xs font-semibold transition-all duration-200 ${
            activeTab === 'lista' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🍿</span>
          <span>Lista</span>
        </button>

        <button
          onClick={() => setActiveTab('sorteador')}
          className={`flex-1 py-1.5 px-2.5 rounded-full flex items-center justify-center space-x-1.5 text-xs font-semibold transition-all duration-200 ${
            activeTab === 'sorteador' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🎲</span>
          <span>Match</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 py-1.5 px-2.5 rounded-full flex items-center justify-center space-x-1.5 text-xs font-semibold transition-all duration-200 ${
            activeTab === 'dashboard' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>📊</span>
          <span>Status</span>
        </button>
      </div>

      {/* ==================== MODAL DE ADICIONAR / EDITAR / IMPORTAR ==================== */}
      {isModalOpen && (
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
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 rounded-lg border border-slate-800"
              >
                ✕
              </button>
            </div>

            {/* SEÇÃO: BUSCA TMDB */}
            {modalMode === 'tmdb' ? (
              <div className="space-y-4">
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
                              e.target.onerror = null;
                              e.target.src = POSTER_FALLBACK;
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded uppercase font-bold">
                                {r.tipo === 'movie' ? '🎬 Filme' : '📺 Série'}
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
                    onClick={() => fileInputRef.current.click()}
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
                      onChange={(e) => setFormTipo(e.target.value)}
                      className="block w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    >
                      <option value="movie">🎬 Filme</option>
                      <option value="series">📺 Série/Anime</option>
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
                      onChange={(e) => setFormStatusAssistido(e.target.value)}
                      className="block w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    >
                      <option value="nao_assistido">⏳ Pendente</option>
                      <option value="em_andamento">🍿 Em Curso</option>
                      <option value="assistido">✓ Assistido</option>
                    </select>
                  </div>

                  {formTipo === 'movie' ? (
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

                {/* Episódio atual — apenas para séries em curso */}
                {formTipo === 'series' && formStatusAssistido === 'em_andamento' && (
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
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormNota(star)}
                        className="p-1 hover:scale-125 transition-transform focus:outline-none"
                      >
                        <svg
                          className={`w-6 h-6 ${
                            star <= formNota 
                              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.3)]' 
                              : 'text-slate-700'
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Anotações Pessoais</label>
                  <textarea
                    value={formNotasPessoais}
                    onChange={(e) => setFormNotasPessoais(e.target.value)}
                    placeholder="Onde assistir, ideias, anotações..."
                    rows="2"
                    className="block w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-700 text-xs focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
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
      )}

      {/* ==================== TOAST DE NOTIFICAÇÃO ==================== */}
      {toast.show && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-24 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-xl shadow-2xl border text-xs font-bold flex items-center space-x-2 animate-[fadeIn_0.2s_ease-out] ${
            toast.type === 'error'
              ? 'bg-red-950/95 border-red-500/40 text-red-200'
              : toast.type === 'info'
              ? 'bg-slate-800/95 border-slate-600/50 text-slate-100'
              : 'bg-emerald-950/95 border-emerald-500/40 text-emerald-200'
          }`}
        >
          <span>
            {toast.type === 'error' ? '⚠️' : toast.type === 'info' ? 'ℹ️' : '✓'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  );
}