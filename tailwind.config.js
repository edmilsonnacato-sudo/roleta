
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0a0a0b',
                surface: '#121214',
                surfaceHighlight: '#1c1c1f',
                primary: '#D4AF37', // Ouro Clássico
                primaryDim: 'rgba(212, 175, 55, 0.1)',
                accent: '#ffffff',
                danger: '#ff4d4d',
                success: '#4ade80',
                textSecondary: '#a1a1aa'
            },
            fontFamily: {
                sans: ['"Inter"', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
                display: ['"Orbitron"', 'sans-serif'],
            },
            boxShadow: {
                'glow': '0 0 20px rgba(212, 175, 55, 0.15)',
                'card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'subtle-grid': 'linear-gradient(to right, #1f1f1f 1px, transparent 1px), linear-gradient(to bottom, #1f1f1f 1px, transparent 1px)',
            }
        },
    },
    plugins: [],
}
