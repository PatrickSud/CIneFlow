// Avaliação por estrelas (reutilizável na lista e no formulário).

interface StarRatingProps {
  value: number;
  onRate: (star: number) => void;
  /** Tamanho das estrelas em Tailwind (ex.: 'w-3.5 h-3.5'). */
  sizeClass?: string;
  /** Efeito de brilho mais forte (usado no formulário). */
  strongGlow?: boolean;
}

export default function StarRating({
  value,
  onRate,
  sizeClass = 'w-3.5 h-3.5',
  strongGlow = false,
}: StarRatingProps) {
  return (
    <>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate(star)}
          aria-label={`Classificar com ${star} ${star === 1 ? 'estrela' : 'estrelas'}`}
          title={`${star} ${star === 1 ? 'estrela' : 'estrelas'}`}
          className="p-0.5 hover:scale-125 transition-transform focus:outline-none"
        >
          <svg
            className={`${sizeClass} ${
              star <= (value || 0)
                ? `text-amber-400 fill-amber-400 ${strongGlow ? 'drop-shadow-[0_0_4px_rgba(251,191,36,0.3)]' : 'drop-shadow-[0_0_2px_rgba(251,191,36,0.2)]'}`
                : 'text-slate-700'
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </>
  );
}
