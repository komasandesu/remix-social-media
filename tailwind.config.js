/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}', // Remixのappディレクトリ内のファイルを対象に
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  mode: 'jit',
  content: ['./app/**/*.{js,ts,jsx,tsx}', './app/routes/**/*.tsx'], // purge -> content
};
