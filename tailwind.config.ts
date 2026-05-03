import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}','./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        creme:'#FAFAF8', blanc:'#FFFFFF', encre:'#111111',
        'gris-1':'#F5F4F1','gris-2':'#ECEAE4','gris-3':'#C8C4BC','gris-4':'#8C8880','gris-5':'#5A5652',
        bleu:'#00349A', rouge:'#C9020D', vert:'#006B3E',
      },
      fontFamily: {
        serif:['"Cormorant Garamond"','Georgia','serif'],
        mono:['"IBM Plex Mono"','monospace'],
        sans:['"IBM Plex Sans"','system-ui','sans-serif'],
      },
      borderWidth: { '0.5': '0.5px' },
    },
  },
  plugins: [],
}
export default config
