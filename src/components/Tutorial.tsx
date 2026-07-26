// Tutorial de boas-vindas para novos usuários.
import { useState } from 'react';

interface Slide {
  emoji: string;
  title: string;
  text: string;
}

const SLIDES: Slide[] = [
  {
    emoji: '🍿',
    title: 'Bem-vindo ao CineFlow',
    text: 'A sua biblioteca pessoal de filmes e séries. Organize o que já viu, o que está a ver e o que quer ver — em qualquer dispositivo.',
  },
  {
    emoji: '🔎',
    title: 'Adicione com um toque',
    text: 'Pesquise na barra do topo: os resultados da web (via TMDB) aparecem com um botão "Adicionar". Título, ano, gênero e pôster vêm preenchidos automaticamente.',
  },
  {
    emoji: '🏷️',
    title: 'Tags e filtros',
    text: 'Crie tags livres (ex.: "Família", "Domingo") e filtre por elas, por tipo e por estado (pode escolher vários, como Pendentes + Em Curso).',
  },
  {
    emoji: '🎲',
    title: 'Não sabe o que ver?',
    text: 'O CineMatch recomenda com base no que você gostou. E o Dashboard mostra o seu progresso, gêneros favoritos e tempo assistido.',
  },
  {
    emoji: '📲',
    title: 'Instale no celular',
    text: 'No telemóvel, toque em "Instalar App" para usar o CineFlow em tela cheia, como um aplicativo. Tudo fica sincronizado na sua conta.',
  },
];

export default function Tutorial({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const last = i === SLIDES.length - 1;
  const s = SLIDES[i];

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative bg-slate-900 rounded-3xl border border-slate-800 max-w-sm w-full p-6 shadow-2xl text-center">
        <button
          onClick={onDone}
          className="absolute top-4 right-4 text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-wider"
        >
          Saltar
        </button>

        <div className="w-16 h-16 mx-auto bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-3xl mb-4 mt-2">
          {s.emoji}
        </div>
        <h3 className="text-base font-black text-white mb-2">{s.title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed min-h-[64px]">{s.text}</p>

        {/* Indicadores */}
        <div className="flex items-center justify-center gap-1.5 my-5">
          {SLIDES.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all ${idx === i ? 'w-5 bg-purple-500' : 'w-1.5 bg-slate-700'}`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          {i > 0 && (
            <button
              onClick={() => setI((v) => v - 1)}
              className="flex-1 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl"
            >
              Voltar
            </button>
          )}
          <button
            onClick={() => (last ? onDone() : setI((v) => v + 1))}
            className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl"
          >
            {last ? 'Começar 🎉' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  );
}
