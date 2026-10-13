/**
 * EMDoryoku — Configuración personalizada de Tailwind CSS (Play CDN)
 */
window.tailwind = window.tailwind || {};
tailwind.config = {
  theme: {
    extend: {
      colors: {
        carbon: '#0E1116',
        asphalt: '#161B22',
        neon: '#00E676',
        crimson: '#FF1744',
        fire: '#FFB300'
      },
      fontFamily: {
        display: ['Syne', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"Roboto Mono"', 'ui-monospace', 'monospace']
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } }
      },
      animation: { float: 'float 6s ease-in-out infinite' }
    }
  }
};
