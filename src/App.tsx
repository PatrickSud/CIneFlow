import React, { useState, useEffect, useMemo, useRef } from 'react';
import { INITIAL_DATABASE } from './data/initialDatabase';
import { searchTmdb, getTmdbKey, setTmdbKey, keyIsFromEnv, fetchTmdbDetails, fetchWatchProviders } from './lib/tmdb';
import { itemHasAllTags, computePreferences, pickMatches, totalWatchMinutes, formatMinutes, bestTmdbMatch } from './lib/library';
import { TYPES, typeLabel, typeEmoji, isSerial, POSTER_FALLBACK } from './lib/contentTypes';
import StarRating from './components/StarRating';
import Toast from './components/Toast';
import type { ToastState, ToastType } from './components/Toast';
import type { Item, Tipo, Status, TmdbSearchResult, WatchProviders, CastMember } from './types';
import ItemCard from './components/ItemCard';
import Dashboard from './components/Dashboard';
import DetailModal from './components/DetailModal';
import ConfirmDialog from './components/ConfirmDialog';
import TagManagerModal from './components/TagManagerModal';
import TmdbHelpModal from './components/TmdbHelpModal';
import IosInstallHelp from './components/IosInstallHelp';
import AddEditModal from './components/AddEditModal';

const STORAGE_KEY = 'cineflow_extended_db_v3';

// Gera IDs únicos e robustos (evita colisões de Date.now() em criações rápidas)
const genId = (prefix: string = 'custom'): string =>
  (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? `${prefix}-${crypto.randomUUID()}`
    : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Estado da Aplicação ---
  const [items, setItems] = useState<Item[]>(() => {
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
  const [filterStatus, setFilterStatus] = useState<string[]>([]); // vazio = todos
  const [sortBy, setSortBy] = useState('title-asc'); 

  // Modal de Adicionar / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('manual'); // manual | import
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Campos do Formulário Manual
  const [formTitulo, setFormTitulo] = useState('');
  const [formTipo, setFormTipo] = useState<Tipo>('movie');
  const [formAno, setFormAno] = useState<number | string>(new Date().getFullYear());
  const [formGeneros, setFormGeneros] = useState('');
  const [formPosterUrl, setFormPosterUrl] = useState('');
  const [formStatusAssistido, setFormStatusAssistido] = useState<Status>('nao_assistido');
  const [formProgresso, setFormProgresso] = useState<number | string>(0);
  const [formTemporadas, setFormTemporadas] = useState<number | string>(0);
  const [formTemporadaAtual, setFormTemporadaAtual] = useState<number | string>(1);
  const [formEpisodioAtual, setFormEpisodioAtual] = useState<number | string>(1);
  const [formNota, setFormNota] = useState(0);
  const [formNotasPessoais, setFormNotasPessoais] = useState('');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  // Metadados extras (enriquecidos via TMDB) que não têm campo visível no formulário
  const emptyExtra: { overview: string; runtime: number; num_temporadas: number; num_episodios: number; elenco: CastMember[]; backdrop_url: string; tmdb_id: number | null; tmdb_media_type: string } = { overview: '', runtime: 0, num_temporadas: 0, num_episodios: 0, elenco: [], backdrop_url: '', tmdb_id: null, tmdb_media_type: '' };
  const [formExtra, setFormExtra] = useState(emptyExtra);

  // Filtro por tags na Lista (interseção — precisa ter todas)
  const [filterTags, setFilterTags] = useState<string[]>([]);

  // Busca TMDB (preenchimento automático de metadados)
  const [tmdbQuery, setTmdbQuery] = useState('');
  const [tmdbResults, setTmdbResults] = useState<TmdbSearchResult[]>([]);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [tmdbError, setTmdbError] = useState('');
  const [tmdbSearched, setTmdbSearched] = useState(false);
  const [tmdbKeyInput, setTmdbKeyInput] = useState('');
  const [hasTmdbKey, setHasTmdbKey] = useState(() => Boolean(getTmdbKey()));
  const [showTmdbHelp, setShowTmdbHelp] = useState(false);
  const [confirmState, setConfirmState] = useState<{ open: boolean; id: string | null; titulo: string }>({ open: false, id: null, titulo: '' });
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);
  const [syncState, setSyncState] = useState({ running: false, done: 0, total: 0, updated: 0 });
  const [showLibMenu, setShowLibMenu] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);

  // Busca web (TMDB) a partir da barra de pesquisa da página inicial
  const [webResults, setWebResults] = useState<TmdbSearchResult[]>([]);
  const [webLoading, setWebLoading] = useState(false);
  const [webError, setWebError] = useState('');

  // Dispara a busca web (com debounce) quando há chave e uma consulta na Lista
  useEffect(() => {
    const q = searchQuery.trim();
    if (!hasTmdbKey || q.length < 2) {
      setWebResults([]);
      setWebError('');
      setWebLoading(false);
      return;
    }
    let active = true;
    setWebLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchTmdb(q);
        if (active) { setWebResults(results); setWebError(''); }
      } catch (err) {
        if (active) {
          setWebResults([]);
          setWebError((err as any).code === 'BAD_KEY' ? 'Chave TMDB inválida.' : 'Não foi possível buscar na web agora.');
        }
      } finally {
        if (active) setWebLoading(false);
      }
    }, 500);
    return () => { active = false; clearTimeout(timer); };
  }, [searchQuery, hasTmdbKey]);

  // Detalhes do título (modal de leitura)
  const [detailItem, setDetailItem] = useState<Item | null>(null);
  const [providers, setProviders] = useState<WatchProviders | null>(null);
  const [providersLoading, setProvidersLoading] = useState(false);

  useEffect(() => {
    if (!detailItem || !hasTmdbKey || !detailItem.tmdb_id) { setProviders(null); return; }
    let active = true;
    setProvidersLoading(true);
    fetchWatchProviders({
      id: detailItem.tmdb_id,
      mediaType: detailItem.tmdb_media_type || (isSerial(detailItem.tipo) ? 'tv' : 'movie'),
      region: 'BR',
    })
      .then((p) => { if (active) setProviders(p); })
      .catch(() => { if (active) setProviders(null); })
      .finally(() => { if (active) setProvidersLoading(false); });
    return () => { active = false; };
  }, [detailItem, hasTmdbKey]);

  // Sorteador (CineMatch)
  const [matchType, setMatchType] = useState('all'); 
  const [matchStatus, setMatchStatus] = useState('nao_assistido'); 
  const [matchMinRating, setMatchMinRating] = useState(0); 
  const [matchCount, setMatchCount] = useState(3);
  const [matchTags, setMatchTags] = useState<string[]>([]);
  const [matchSmart, setMatchSmart] = useState(true);
  const [matchHistory, setMatchHistory] = useState<string[]>([]); // ids já sugeridos (evitar repetição)
  const [matchedItems, setMatchedItems] = useState<Item[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [matchMessage, setMatchMessage] = useState('');

  // Ao mudar os critérios, recomeça o histórico de "não repetir"
  useEffect(() => { setMatchHistory([]); }, [matchType, matchStatus, matchMinRating, matchTags, matchSmart]);

  // Notificações (Toast)
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });
  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // --- PWA / instalação no celular ---
  const deferredPromptRef = useRef<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    const ua = window.navigator.userAgent || '';
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const mobile =
      ios ||
      /Android/i.test(ua) ||
      (window.matchMedia('(max-width: 768px)').matches && 'ontouchstart' in window);

    setIsStandalone(standalone);
    setIsIos(ios);
    setIsMobile(mobile);

    let dismissed = false;
    try { dismissed = localStorage.getItem('cineflow_install_dismissed') === '1'; } catch {}
    if (mobile && !standalone && !dismissed) setShowInstallBanner(true);

    const onBeforeInstall = (e: any) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setCanInstall(true);
    };
    const onInstalled = () => {
      deferredPromptRef.current = null;
      setCanInstall(false);
      setShowInstallBanner(false);
      setIsStandalone(true);
      showToast('CineFlow instalado! 🎉');
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const dp = deferredPromptRef.current;
    if (dp) {
      dp.prompt();
      try { await dp.userChoice; } catch {}
      deferredPromptRef.current = null;
      setCanInstall(false);
      setShowInstallBanner(false);
    } else if (isIos) {
      setShowIosHelp(true);
    } else {
      showToast('No menu do navegador, toque em "Instalar app".', 'info');
    }
  };

  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    try { localStorage.setItem('cineflow_install_dismissed', '1'); } catch {}
  };

  // --- Tags ---
  // Lista global de todas as tags em uso (ordenada), para sugestões e filtros
  const allTags = useMemo(() => {
    const set = new Map(); // chave em minúsculas -> rótulo original
    items.forEach(i => {
      if (Array.isArray(i.tags)) {
        i.tags.forEach(t => {
          const label = String(t).trim();
          if (label) set.set(label.toLowerCase(), label);
        });
      }
    });
    return Array.from(set.values()).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const addFormTag = (raw: string) => {
    const label = String(raw).trim();
    if (!label) return;
    setFormTags(prev =>
      prev.some(t => t.toLowerCase() === label.toLowerCase()) ? prev : [...prev, label]
    );
    setTagInput('');
  };

  const removeFormTag = (label: string) => {
    setFormTags(prev => prev.filter(t => t !== label));
  };

  // Alterna uma tag em um array de seleção (usado no filtro da Lista e no Match)
  const toggleTagIn = (setter: React.Dispatch<React.SetStateAction<string[]>>, label: string) => {
    setter(prev =>
      prev.some(t => t.toLowerCase() === label.toLowerCase())
        ? prev.filter(t => t.toLowerCase() !== label.toLowerCase())
        : [...prev, label]
    );
  };

  // (itemHasAllTags vem de ./lib/library)

  // --- Funções do Formulário ---
  const handleOpenAddModal = (mode?: string) => {
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
    setFormTags([]);
    setTagInput('');
    setFormExtra(emptyExtra);
    setTmdbQuery('');
    setTmdbResults([]);
    setTmdbError('');
    setTmdbSearched(false);
    setModalMode(mode || (hasTmdbKey ? 'tmdb' : 'manual'));
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Item) => {
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
    setFormTags(Array.isArray(item.tags) ? item.tags : []);
    setTagInput('');
    setFormExtra({
      overview: item.overview || '',
      runtime: item.runtime || 0,
      num_temporadas: item.num_temporadas || 0,
      num_episodios: item.num_episodios || 0,
      elenco: Array.isArray(item.elenco) ? item.elenco : [],
      backdrop_url: item.backdrop_url || '',
      tmdb_id: item.tmdb_id || null,
      tmdb_media_type: item.tmdb_media_type || '',
    });
    setModalMode('manual');
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
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
      temporadas_assistidas_max: isSerial(formTipo) ? Number(formTemporadas) : 0,
      temporada_atual: isSerial(formTipo) && formStatusAssistido === 'em_andamento' ? Number(formTemporadaAtual) : 0,
      episodio_atual: isSerial(formTipo) && formStatusAssistido === 'em_andamento' ? Number(formEpisodioAtual) : 0,
      nota: Number(formNota),
      notas_pessoais: formNotasPessoais.trim(),
      tags: formTags.map(t => t.trim()).filter(Boolean),
      overview: formExtra.overview || '',
      runtime: Number(formExtra.runtime) || 0,
      num_temporadas: Number(formExtra.num_temporadas) || 0,
      num_episodios: Number(formExtra.num_episodios) || 0,
      elenco: Array.isArray(formExtra.elenco) ? formExtra.elenco : [],
      backdrop_url: formExtra.backdrop_url || '',
      tmdb_id: formExtra.tmdb_id || null,
      tmdb_media_type: formExtra.tmdb_media_type || ''
    };

    if (editingItem) {
      setItems(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...recordData } : item));
      showToast('Título atualizado com sucesso!');
    } else {
      const newItem: Item = {
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
  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      try {
        const parsed = JSON.parse((event.target?.result as string));
        const rawList = parsed.biblioteca || (Array.isArray(parsed) ? parsed : null);

        if (!rawList || !Array.isArray(rawList)) {
          showToast('Formato JSON incompatível. Certifique-se de que possui uma lista válida.', 'error');
          return;
        }

        setItems(prev => {
          const currentMap = new Map(prev.map(item => [item.id, item]));

          rawList.forEach((raw: any, idx: number) => {
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
              temporada_atual: Number(raw.temporada_atual || 0),
              episodio_atual: Number(raw.episodio_atual || 0),
              nota: Number(raw.nota || raw.rating || 0),
              notas_pessoais: raw.notas_pessoais || raw.notes || '',
              tags: Array.isArray(raw.tags) ? raw.tags.map((t: any) => String(t).trim()).filter(Boolean) : [],
              overview: raw.overview || '',
              runtime: Number(raw.runtime || 0),
              num_temporadas: Number(raw.num_temporadas || 0),
              num_episodios: Number(raw.num_episodios || 0),
              elenco: Array.isArray(raw.elenco) ? raw.elenco : [],
              backdrop_url: raw.backdrop_url || '',
              tmdb_id: raw.tmdb_id || null,
              tmdb_media_type: raw.tmdb_media_type || ''
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

  // --- Atualizar toda a biblioteca com dados atuais do TMDB ---
  // Preserva dados pessoais (nota, estado, tags, notas, progresso) e atualiza só metadados.
  const handleRefreshTmdb = async () => {
    setShowSyncConfirm(false);
    const current = [...items];
    setSyncState({ running: true, done: 0, total: current.length, updated: 0 });
    let updated = 0;
    let cursor = 0;
    const CONC = 5; // requisições em paralelo

    const processOne = async (idx: number) => {
      const it = current[idx];
      try {
        let id = it.tmdb_id;
        let media = it.tmdb_media_type;

        // Item manual (sem tmdb_id): tenta descobrir pelo título.
        if (!id) {
          const results = await searchTmdb(it.titulo);
          const match = bestTmdbMatch({ titulo: it.titulo, ano: it.ano }, results);
          if (match) {
            id = match.tmdb_id;
            media = match.media_type;
            current[idx] = {
              ...current[idx],
              tmdb_id: id,
              tmdb_media_type: media,
              generos: (!it.generos || it.generos.length === 0) && match.generos.length ? match.generos : it.generos,
              poster_url: it.poster_url || match.poster_url,
              overview: it.overview || match.overview,
            };
          }
        }

        if (id) {
          const d = await fetchTmdbDetails({ id, mediaType: media || (isSerial(it.tipo) ? 'tv' : 'movie') });
          if (d) {
            current[idx] = {
              ...current[idx],
              overview: d.overview || current[idx].overview || '',
              runtime: d.runtime || current[idx].runtime || 0,
              num_temporadas: d.num_temporadas || current[idx].num_temporadas || 0,
              num_episodios: d.num_episodios || current[idx].num_episodios || 0,
              elenco: d.elenco && d.elenco.length ? d.elenco : current[idx].elenco,
              backdrop_url: d.backdrop_url || current[idx].backdrop_url || '',
              tmdb_id: id,
              tmdb_media_type: media || current[idx].tmdb_media_type,
            };
            updated++;
          }
        }
      } catch (e) {
        /* ignora falhas pontuais e segue */
      }
      setSyncState((s) => ({ ...s, done: s.done + 1, updated }));
    };

    const worker = async () => {
      while (cursor < current.length) {
        const idx = cursor++;
        await processOne(idx);
      }
    };
    await Promise.all(Array.from({ length: Math.min(CONC, current.length) }, () => worker()));

    setItems(current);
    setSyncState((s) => ({ ...s, running: false }));
    showToast(`Atualização concluída: ${updated} de ${current.length} título(s) enriquecido(s).`);
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

  const handleTmdbSearch = async (e?: React.FormEvent) => {
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
      if ((err as any).code === 'NO_KEY') {
        setHasTmdbKey(false);
        setTmdbError('Configure a sua chave TMDB para pesquisar.');
      } else if ((err as any).code === 'BAD_KEY') {
        setTmdbError('Chave TMDB inválida. Verifique e tente novamente.');
      } else {
        setTmdbError('Não foi possível pesquisar agora. Verifique a sua ligação.');
      }
    } finally {
      setTmdbLoading(false);
    }
  };

  // Preenche o formulário manual com um resultado do TMDB (para revisão antes de guardar)
  const fillFormFromTmdb = (r: TmdbSearchResult) => {
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
    setFormTags([]);
    setTagInput('');
    setFormExtra({ ...emptyExtra, overview: r.overview || '', tmdb_id: r.tmdb_id || null, tmdb_media_type: r.media_type || '' });
    setModalMode('manual');
    // Enriquecimento assíncrono (sinopse completa, duração, temporadas, elenco, backdrop)
    if (r.tmdb_id && r.media_type) {
      fetchTmdbDetails({ id: r.tmdb_id, mediaType: r.media_type })
        .then((d) => {
          if (!d) return;
          setFormExtra((prev) => ({
            ...prev,
            overview: d.overview || prev.overview,
            runtime: d.runtime || 0,
            num_temporadas: d.num_temporadas || 0,
            num_episodios: d.num_episodios || 0,
            elenco: d.elenco || [],
            backdrop_url: d.backdrop_url || '',
          }));
          if (d.num_temporadas) setFormTemporadas(d.num_temporadas);
        })
        .catch(() => {});
    }
  };

  // A partir da aba Buscar (modal já aberto)
  const handlePickTmdb = (r: TmdbSearchResult) => {
    fillFormFromTmdb(r);
    showToast('Dados preenchidos — revise e guarde.', 'info');
  };

  // A partir dos resultados web da página inicial (abre o modal para revisão)
  const handleAddFromApi = (r: TmdbSearchResult) => {
    fillFormFromTmdb(r);
    setIsModalOpen(true);
    showToast('Revise os dados e guarde na biblioteca.', 'info');
  };

  // Adiciona direto à biblioteca (1 toque), enriquecendo em segundo plano
  const handleQuickAddFromApi = async (r: TmdbSearchResult) => {
    if (isInLibrary(r)) { showToast('Este título já está na biblioteca.', 'info'); return; }
    let extra: { overview: string; runtime: number; num_temporadas: number; num_episodios: number; elenco: CastMember[]; backdrop_url: string } = { overview: r.overview || '', runtime: 0, num_temporadas: 0, num_episodios: 0, elenco: [], backdrop_url: '' };
    try {
      if (r.tmdb_id && r.media_type) {
        const d = await fetchTmdbDetails({ id: r.tmdb_id, mediaType: r.media_type });
        if (d) extra = { ...extra, ...d };
      }
    } catch {}
    const newItem: Item = {
      id: genId('custom'),
      titulo: r.titulo,
      tipo: r.tipo,
      ano: Number(r.ano) || new Date().getFullYear(),
      generos: Array.isArray(r.generos) ? r.generos : [],
      poster_url: r.poster_url || '',
      status_assistido: 'nao_assistido',
      progresso_porcentagem: 0,
      temporadas_assistidas_max: 0,
      temporada_atual: 0,
      episodio_atual: 0,
      nota: 0,
      notas_pessoais: '',
      tags: [],
      data_adicao: new Date().toISOString(),
      overview: extra.overview,
      runtime: extra.runtime,
      num_temporadas: extra.num_temporadas,
      num_episodios: extra.num_episodios,
      elenco: extra.elenco,
      backdrop_url: extra.backdrop_url,
      tmdb_id: r.tmdb_id || null,
      tmdb_media_type: r.media_type || '',
    };
    setItems((prev) => [newItem, ...prev]);
    showToast(`"${r.titulo}" adicionado à biblioteca!`);
  };

  // O título (aproximadamente) já está na biblioteca?
  const isInLibrary = (r: TmdbSearchResult) =>
    items.some(
      (i) =>
        i.titulo.trim().toLowerCase() === r.titulo.trim().toLowerCase() &&
        (!r.ano || Number(i.ano) === Number(r.ano))
    );

  // Deletar Item (abre confirmação estilizada)
  const handleDeleteItem = (id: string, titulo: string) => {
    setConfirmState({ open: true, id, titulo });
  };
  const confirmDelete = () => {
    const { id } = confirmState;
    setItems(prev => prev.filter(item => item.id !== id));
    setMatchedItems(prev => prev.filter(item => item.id !== id));
    setConfirmState({ open: false, id: null, titulo: '' });
    showToast('Registo excluído com sucesso!', 'info');
  };

  // --- Gerenciador de Tags (aplica a toda a biblioteca) ---
  const renameTagGlobally = (oldLabel: string, newLabelRaw: string) => {
    const newLabel = String(newLabelRaw).trim();
    if (!newLabel || newLabel.toLowerCase() === oldLabel.toLowerCase()) return;
    setItems(prev => prev.map(item => {
      if (!Array.isArray(item.tags)) return item;
      let changed = false;
      const next: string[] = [];
      item.tags.forEach(t => {
        const val = t.toLowerCase() === oldLabel.toLowerCase() ? newLabel : t;
        if (!next.some(x => x.toLowerCase() === val.toLowerCase())) next.push(val);
        if (val !== t) changed = true;
      });
      return changed ? { ...item, tags: next } : item;
    }));
    setFilterTags(prev => prev.map(t => (t.toLowerCase() === oldLabel.toLowerCase() ? newLabel : t)));
    setMatchTags(prev => prev.map(t => (t.toLowerCase() === oldLabel.toLowerCase() ? newLabel : t)));
    showToast(`Tag "${oldLabel}" renomeada para "${newLabel}".`);
  };
  const deleteTagGlobally = (label: string) => {
    setItems(prev => prev.map(item =>
      Array.isArray(item.tags)
        ? { ...item, tags: item.tags.filter(t => t.toLowerCase() !== label.toLowerCase()) }
        : item
    ));
    setFilterTags(prev => prev.filter(t => t.toLowerCase() !== label.toLowerCase()));
    setMatchTags(prev => prev.filter(t => t.toLowerCase() !== label.toLowerCase()));
    showToast(`Tag "${label}" removida de toda a biblioteca.`, 'info');
  };

  // Alteração Rápida de Status
  const handleToggleWatchedQuickly = (id: string) => {
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
  const handleRateQuickly = (id: string, ratingValue: number) => {
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
        const tagSearchMatch = Array.isArray(item.tags) &&
          item.tags.some(t => t.toLowerCase().includes(q));
        const matchesSearch = q === '' || titleMatch || notesMatch || genreMatch || tagSearchMatch;

        const matchesType = filterType === 'all' || item.tipo === filterType;

        const matchesStatus = filterStatus.length === 0 || filterStatus.includes(item.status_assistido);

        const matchesTags = itemHasAllTags(item, filterTags);

        return matchesSearch && matchesType && matchesStatus && matchesTags;
      })
      .sort((a, b) => {
        if (sortBy === 'title-asc') return a.titulo.localeCompare(b.titulo);
        if (sortBy === 'title-desc') return b.titulo.localeCompare(a.titulo);
        if (sortBy === 'rating-desc') return b.nota - a.nota;
        if (sortBy === 'newest') return new Date(b.data_adicao).getTime() - new Date(a.data_adicao).getTime();
        if (sortBy === 'ano-desc') return b.ano - a.ano;
        return 0;
      });
  }, [items, searchQuery, filterType, filterStatus, sortBy, filterTags]);

  // --- Estatísticas ---
  const stats = useMemo(() => {
    const total = items.length;
    const movies = items.filter(i => !isSerial(i.tipo)).length;
    const shows = items.filter(i => isSerial(i.tipo)).length;
    const watched = items.filter(i => i.status_assistido === 'assistido').length;
    const inProgress = items.filter(i => i.status_assistido === 'em_andamento').length;
    const unwatched = items.filter(i => i.status_assistido === 'nao_assistido').length;
    const watchedPercent = total > 0 ? Math.round((watched / total) * 100) : 0;
    
    const ratedItems = items.filter(i => i.nota > 0);
    const avgRating = ratedItems.length > 0
      ? (ratedItems.reduce((acc, i) => acc + i.nota, 0) / ratedItems.length).toFixed(1)
      : '0.0';

    // Distribuição por gênero (top 8)
    const genreCount: Record<string, number> = {};
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
    const decadeCount: Record<number, number> = {};
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

    // Distribuição por tipo (apenas os que têm ao menos 1 título)
    const byType = TYPES
      .map(t => ({ ...t, qtd: items.filter(i => i.tipo === t.id).length }))
      .filter(t => t.qtd > 0)
      .sort((a, b) => b.qtd - a.qtd);

    const tempoAssistidoMin = totalWatchMinutes(items, isSerial);

    return { total, movies, shows, watched, inProgress, unwatched, watchedPercent, avgRating, topGenres, decades, byType, tempoAssistidoMin };
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
        const matchTagsOk = itemHasAllTags(item, matchTags);
        return matchT && matchS && matchR && matchTagsOk;
      });

      if (pool.length === 0) {
        setMatchedItems([]);
        setMatchMessage('Nenhum título encontrado com esses critérios de busca.');
        setIsShuffling(false);
        return;
      }

      const prefs = computePreferences(items);
      const selected = pickMatches(pool, {
        count: matchCount,
        smart: matchSmart,
        prefs,
        exclude: matchHistory,
      });

      setMatchedItems(selected);
      setMatchHistory(prev => [...prev, ...selected.map(s => s.id)]);
      setIsShuffling(false);
      showToast(matchSmart ? 'Recomendações personalizadas!' : 'Seleção CineMatch realizada!');
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
            {hasTmdbKey && (
              <button
                onClick={() => setShowSyncConfirm(true)}
                disabled={syncState.running}
                aria-label="Atualizar toda a biblioteca com dados do TMDB"
                title="Atualizar metadados de toda a biblioteca via TMDB"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-60 text-slate-200 text-sm rounded-xl border border-slate-700 transition-all"
              >
                {syncState.running ? '⏳' : '🔄'}
              </button>
            )}
            {/* Menu consolidado: Biblioteca */}
            <div className="relative">
              <button
                onClick={() => setShowLibMenu((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={showLibMenu}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg flex items-center space-x-1.5 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>Biblioteca</span>
                <span className="text-[9px]">▾</span>
              </button>

              {showLibMenu && (
                <>
                  {/* click-away */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowLibMenu(false)}></div>
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-60 z-50 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-1.5 text-left"
                  >
                    <p className="px-3 pt-2 pb-1 text-[9px] font-black uppercase tracking-widest text-slate-500">Adicionar</p>
                    <button role="menuitem" onClick={() => { setShowLibMenu(false); handleOpenAddModal('manual'); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors">
                      <span>🍿</span> Adicionar manualmente
                    </button>
                    <button role="menuitem" onClick={() => { setShowLibMenu(false); handleOpenAddModal('import'); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors">
                      <span>📥</span> Importar JSON
                    </button>

                    <div className="my-1 border-t border-slate-800"></div>
                    <p className="px-3 pt-1 pb-1 text-[9px] font-black uppercase tracking-widest text-slate-500">Gerir</p>
                    <button role="menuitem" onClick={() => { setShowLibMenu(false); handleOpenAddModal('tmdb'); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors">
                      <span>⚙️</span> Configurar chave TMDB
                    </button>
                    <button role="menuitem" onClick={() => { setShowLibMenu(false); handleExport(); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors">
                      <span>💾</span> Exportar backup (JSON)
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* Banner automático de instalação (celular) */}
      {showInstallBanner && !isStandalone && (
        <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white px-4 py-3 flex items-center gap-3 shadow-lg">
          <span className="text-xl">📲</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold leading-tight">Instale o CineFlow no seu telemóvel</p>
            <p className="text-[10px] text-purple-100/90 leading-tight">Acesso rápido, tela cheia e uso offline.</p>
          </div>
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 bg-white text-purple-700 text-xs font-black uppercase tracking-wider rounded-lg hover:bg-purple-50 transition-colors whitespace-nowrap"
          >
            Instalar
          </button>
          <button
            onClick={dismissInstallBanner}
            aria-label="Dispensar"
            className="p-1 text-purple-200 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

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
                  placeholder={hasTmdbKey ? 'Pesquisar na biblioteca e na web (TMDB)...' : 'Pesquisar por título, notas, género ou tag...'}
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
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="block w-full py-1.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="all">✨ Tudo</option>
                    {TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Status Assistido */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Estado de Visualização <span className="text-slate-600 normal-case font-normal">(pode escolher vários)</span>
                  </label>
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setFilterStatus([])}
                      className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                        filterStatus.length === 0 ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Todos
                    </button>
                    {[
                      { id: 'nao_assistido', label: 'Pendentes' },
                      { id: 'em_andamento', label: 'Em Curso' },
                      { id: 'assistido', label: 'Vistos' },
                    ].map((opt) => {
                      const active = filterStatus.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setFilterStatus((prev) =>
                              prev.includes(opt.id) ? prev.filter((x) => x !== opt.id) : [...prev, opt.id]
                            )
                          }
                          className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                            active ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {active ? '✓ ' : ''}{opt.label}
                        </button>
                      );
                    })}
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

              {/* Filtro por Tags (interseção — mostra só o que tem todas as marcadas) */}
              {allTags.length > 0 && (
                <div className="pt-3 border-t border-slate-800/50">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Tags {filterTags.length > 0 && <span className="text-purple-400">({filterTags.length} ativas · precisa ter todas)</span>}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowTagManager(true)}
                      className="text-[10px] font-bold text-slate-500 hover:text-purple-300 underline"
                    >
                      ⚙️ Gerir tags
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {allTags.map(t => {
                      const active = filterTags.some(f => f.toLowerCase() === t.toLowerCase());
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleTagIn(setFilterTags, t)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                            active
                              ? 'bg-purple-600 text-white border-purple-500'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-purple-500/40 hover:text-purple-300'
                          }`}
                        >
                          {active ? '✓ ' : '#'}{t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Cabeçalho de Resultados */}
            <div className="flex items-center justify-between px-2 text-xs">
              <span className="font-semibold text-slate-400">
                A exibir <strong className="text-white">{processedItems.length}</strong> de {items.length} registados
              </span>
              {(searchQuery || filterType !== 'all' || filterStatus.length > 0 || filterTags.length > 0) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('all');
                    setFilterStatus([]);
                    setFilterTags([]);
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
                  <ItemCard
                    key={item.id}
                    item={item}
                    onOpenDetail={setDetailItem}
                    onRate={handleRateQuickly}
                    onToggleWatched={handleToggleWatchedQuickly}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteItem}
                    onTagClick={(t) => { setFilterTags([t]); setActiveTab('lista'); }}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center max-w-md mx-auto">
                <p className="text-sm text-slate-400">Nenhum título encontrado com a filtragem atual.</p>
              </div>
            )}

            {/* ===== Resultados da Web (TMDB) ===== */}
            {hasTmdbKey && searchQuery.trim().length >= 2 && (webLoading || webError || webResults.length > 0) && (
              <div className="pt-4 space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-lg">🌐</span>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">
                    Resultados da Web
                  </h3>
                  <span className="text-[10px] text-slate-500 font-semibold">via TMDB · não estão na sua biblioteca</span>
                  {webLoading && (
                    <div className="w-3.5 h-3.5 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin ml-1"></div>
                  )}
                </div>

                {webError ? (
                  <p className="text-[11px] text-red-300 bg-red-950/40 border border-red-500/20 rounded-lg px-3 py-2 max-w-md">
                    {webError}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {webResults.map((r) => {
                      const jaTem = isInLibrary(r);
                      return (
                        <div
                          key={r.key}
                          className="bg-slate-900/60 border border-dashed border-slate-700/70 rounded-2xl p-3 flex gap-3 items-start"
                        >
                          <img
                            src={r.poster_url || POSTER_FALLBACK}
                            alt={r.titulo}
                            className="w-14 h-20 object-cover rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = POSTER_FALLBACK; }}
                          />
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded uppercase font-bold">
                                {typeEmoji(r.tipo)} {typeLabel(r.tipo)}
                              </span>
                              <span className="text-[10px] text-slate-500 font-bold">{r.ano || 's/ ano'}</span>
                            </div>
                            <p className="text-xs font-bold text-white leading-tight line-clamp-2" title={r.titulo}>{r.titulo}</p>
                            {r.generos.length > 0 && (
                              <p className="text-[10px] text-slate-500 truncate">{r.generos.join(', ')}</p>
                            )}
                            {jaTem ? (
                              <span className="inline-block text-[10px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/20 px-2 py-1 rounded-lg">
                                ✓ Na biblioteca
                              </span>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                <button
                                  onClick={() => handleQuickAddFromApi(r)}
                                  title="Adicionar direto (1 toque)"
                                  className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-white bg-purple-600 hover:bg-purple-700 px-2.5 py-1 rounded-lg transition-colors"
                                >
                                  + Adicionar
                                </button>
                                <button
                                  onClick={() => handleAddFromApi(r)}
                                  title="Adicionar revisando os detalhes"
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-300 bg-slate-950 border border-slate-800 hover:border-purple-500/40 px-2 py-1 rounded-lg transition-colors"
                                >
                                  Detalhes…
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
                  {TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>
                  ))}
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

            {/* Filtro por Tags no Match (interseção) */}
            {allTags.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Filtrar por Tags {matchTags.length > 0 && <span className="text-purple-400">({matchTags.length} ativas · precisa ter todas)</span>}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map(t => {
                    const active = matchTags.some(f => f.toLowerCase() === t.toLowerCase());
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTagIn(setMatchTags, t)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                          active
                            ? 'bg-purple-600 text-white border-purple-500'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-purple-500/40 hover:text-purple-300'
                        }`}
                      >
                        {active ? '✓ ' : '#'}{t}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <label className="flex items-center gap-2 px-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={matchSmart}
                onChange={(e) => setMatchSmart(e.target.checked)}
                className="w-4 h-4 accent-purple-600"
              />
              <span className="text-[11px] font-semibold text-slate-300">
                🧠 Recomendação inteligente <span className="text-slate-500 font-normal">(baseada nos seus gostos; senão, sorteio aleatório)</span>
              </span>
            </label>

            <button
              onClick={handleCineMatch}
              disabled={isShuffling}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 disabled:opacity-60 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              {isShuffling ? "A escolher..." : (matchSmart ? "🧠 Recomendar" : "🎲 Sortear Sugestões")}
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
                            {typeEmoji(item.tipo)} {typeLabel(item.tipo)}
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
        {activeTab === 'dashboard' && <Dashboard stats={stats} items={items} />}

      </main>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 text-center text-slate-500 text-xs mb-20">
        <p>🍿 CineFlow — Armazenamento seguro de dados locais.</p>
      </footer>

      {/* Botão flutuante de instalar — sempre visível no celular (fora do modo instalado) */}
      {isMobile && !isStandalone && (
        <button
          onClick={handleInstallClick}
          aria-label="Instalar o CineFlow no telemóvel"
          className="fixed bottom-20 right-4 z-50 flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black uppercase tracking-wider rounded-full shadow-2xl shadow-purple-900/40 active:scale-95 transition-all"
        >
          <span className="text-sm">📲</span>
          <span>Instalar App</span>
        </button>
      )}

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
        <AddEditModal
          editingItem={editingItem}
          modalMode={modalMode}
          setModalMode={setModalMode}
          hasTmdbKey={hasTmdbKey}
          setHasTmdbKey={setHasTmdbKey}
          keyIsFromEnv={keyIsFromEnv}
          fileInputRef={fileInputRef}
          allTags={allTags}
          formTitulo={formTitulo}
          setFormTitulo={setFormTitulo}
          formTipo={formTipo}
          setFormTipo={setFormTipo}
          formAno={formAno}
          setFormAno={setFormAno}
          formGeneros={formGeneros}
          setFormGeneros={setFormGeneros}
          formPosterUrl={formPosterUrl}
          setFormPosterUrl={setFormPosterUrl}
          formStatusAssistido={formStatusAssistido}
          setFormStatusAssistido={setFormStatusAssistido}
          formProgresso={formProgresso}
          setFormProgresso={setFormProgresso}
          formTemporadas={formTemporadas}
          setFormTemporadas={setFormTemporadas}
          formTemporadaAtual={formTemporadaAtual}
          setFormTemporadaAtual={setFormTemporadaAtual}
          formEpisodioAtual={formEpisodioAtual}
          setFormEpisodioAtual={setFormEpisodioAtual}
          formNota={formNota}
          setFormNota={setFormNota}
          formNotasPessoais={formNotasPessoais}
          setFormNotasPessoais={setFormNotasPessoais}
          formTags={formTags}
          tagInput={tagInput}
          setTagInput={setTagInput}
          tmdbQuery={tmdbQuery}
          setTmdbQuery={setTmdbQuery}
          tmdbResults={tmdbResults}
          tmdbLoading={tmdbLoading}
          tmdbError={tmdbError}
          tmdbSearched={tmdbSearched}
          tmdbKeyInput={tmdbKeyInput}
          setTmdbKeyInput={setTmdbKeyInput}
          setTmdbResults={setTmdbResults}
          setTmdbSearched={setTmdbSearched}
          setShowTmdbHelp={setShowTmdbHelp}
          handleSaveForm={handleSaveForm}
          handleJsonImport={handleJsonImport}
          handleSaveTmdbKey={handleSaveTmdbKey}
          handleTmdbSearch={handleTmdbSearch}
          handlePickTmdb={handlePickTmdb}
          addFormTag={addFormTag}
          removeFormTag={removeFormTag}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* ==================== CONFIRMAÇÃO: ATUALIZAR TMDB ==================== */}
      <ConfirmDialog
        open={showSyncConfirm}
        icon="🔄"
        title="Atualizar biblioteca pelo TMDB?"
        confirmLabel="Atualizar"
        tone="primary"
        onConfirm={handleRefreshTmdb}
        onClose={() => setShowSyncConfirm(false)}
      >
        <span className="block mb-2">
          Vou reler os <strong className="text-slate-200">{items.length}</strong> títulos e atualizar sinopse, duração, temporadas/episódios, elenco e pôster com os dados atuais do TMDB. Itens adicionados manualmente serão associados pelo nome.
        </span>
        <span className="block text-[11px] text-slate-500">
          As suas informações pessoais (nota, estado, tags, anotações e progresso) são preservadas. Pode levar um tempo.
        </span>
      </ConfirmDialog>

      {/* ==================== PROGRESSO: ATUALIZAR TMDB ==================== */}
      {syncState.running && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-3"></div>
            <h3 className="text-sm font-black text-white mb-1">A atualizar pelo TMDB…</h3>
            <p className="text-xs text-slate-400 mb-3">{syncState.done} de {syncState.total} · {syncState.updated} enriquecidos</p>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
              <div
                className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full transition-all"
                style={{ width: `${syncState.total ? Math.round((syncState.done / syncState.total) * 100) : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CONFIRMAÇÃO DE EXCLUSÃO ==================== */}
      <ConfirmDialog
        open={confirmState.open}
        icon="🗑️"
        title="Remover da biblioteca?"
        confirmLabel="Remover"
        tone="danger"
        onConfirm={confirmDelete}
        onClose={() => setConfirmState({ open: false, id: null, titulo: '' })}
      >
        "<strong className="text-slate-200">{confirmState.titulo}</strong>" será apagado. Esta ação não pode ser desfeita.
      </ConfirmDialog>

      {/* ==================== GERENCIADOR DE TAGS ==================== */}
      <TagManagerModal
        open={showTagManager}
        allTags={allTags}
        items={items}
        onRename={renameTagGlobally}
        onDelete={deleteTagGlobally}
        onClose={() => setShowTagManager(false)}
      />

      {/* ==================== DETALHES DO TÍTULO ==================== */}
      {detailItem && (
        <DetailModal
          item={detailItem}
          providers={providers}
          providersLoading={providersLoading}
          hasTmdbKey={hasTmdbKey}
          onClose={() => setDetailItem(null)}
          onEdit={handleOpenEditModal}
        />
      )}

      {/* ==================== AJUDA: OBTER CHAVE DE API (TMDB) ==================== */}
      <TmdbHelpModal open={showTmdbHelp} onClose={() => setShowTmdbHelp(false)} />

      {/* ==================== INSTRUÇÕES DE INSTALAÇÃO (iOS) ==================== */}
      <IosInstallHelp open={showIosHelp} onClose={() => setShowIosHelp(false)} />

      {/* ==================== TOAST DE NOTIFICAÇÃO ==================== */}
      <Toast toast={toast} />

    </div>
  );
}