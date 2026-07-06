import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0B1220',
        surface: '#131B2E',
        surface2: '#1B2540',
        border: '#26314D',
        accent: '#4F6DF5',
        accentSoft: '#8DA0FA',
        risk: {
          low: '#2ECC71',
          medium: '#F5C518',
          high: '#F5A623',
          critical: '#E5484D',
        },
        ink: '#E6E9F2',
        muted: '#8894B0',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: { xl: '14px', '2xl': '20px' },
    },
  },
  plugins: [],
};
export default config;
