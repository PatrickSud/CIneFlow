/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      // Classes personalizadas usadas no design original que não existem
      // no Tailwind por padrão. Sem isto, elas seriam ignoradas silenciosamente.
      colors: {
        slate: {
          850: '#172033',
        },
      },
      spacing: {
        5.5: '1.375rem', // usado em w-5.5 / h-5.5 (logo do cabeçalho)
      },
    },
  },
  plugins: [],
};
