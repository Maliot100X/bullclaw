import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bull': '#FFB81C',
        'claw': '#1a1a1a',
        'ansem': '#8B5CF6',
      },
    },
  },
  plugins: [],
}
export default config
