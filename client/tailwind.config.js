/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: {
                    DEFAULT: '#08090C',
                    secondary: '#0C0D12',
                },
                surface: {
                    DEFAULT: '#111319',
                    2: '#161822',
                    3: '#1C1F2C',
                },
                accent: {
                    DEFAULT: '#10B981',
                    2: '#34D399',
                    glow: 'rgba(16, 185, 129, 0.18)',
                    'glow-strong': 'rgba(16, 185, 129, 0.30)',
                },
                positive: {
                    DEFAULT: '#10B981',
                    light: '#34D399',
                    dim: 'rgba(16, 185, 129, 0.15)',
                    subtle: 'rgba(16, 185, 129, 0.08)',
                },
                negative: {
                    DEFAULT: '#F43F5E',
                    light: '#FB7185',
                    dim: 'rgba(244, 63, 94, 0.14)',
                },
                warning: {
                    DEFAULT: '#F59E0B',
                    dim: 'rgba(245, 158, 11, 0.14)',
                },
                purple: {
                    DEFAULT: '#8B5CF6',
                    light: '#A78BFA',
                    dim: 'rgba(139, 92, 246, 0.15)',
                },
                brandText: {
                    primary: '#F3F4F6',
                    secondary: '#9CA3AF',
                    muted: '#6B7280',
                    disabled: '#4B5563',
                },
                brandBorder: {
                    DEFAULT: 'rgba(255, 255, 255, 0.08)',
                    light: 'rgba(255, 255, 255, 0.12)',
                    hover: 'rgba(16, 185, 129, 0.40)',
                    active: 'rgba(16, 185, 129, 0.60)',
                },
            },
            borderRadius: {
                sm: '4px',
                md: '6px',
                lg: '8px',
                card: '12px',
                hero: '14px',
                xl: '16px',
                pill: '999px',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
                mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
            },
        },
    },
    plugins: [],
}
