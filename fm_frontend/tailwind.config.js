import plugin from 'tailwindcss/plugin'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        '.background-primary':         { backgroundColor: 'var(--color-primary)' },
        '.background-primary-soft':    { backgroundColor: 'var(--color-primary-soft)' },
        '.background-primary-hover':   { backgroundColor: 'var(--color-primary-hover)' },
        '.foreground-primary':         { color: 'var(--color-primary)' },
        '.foreground-primary-soft':    { color: 'var(--color-primary-soft)' },
        '.foreground-primary-dim':     { color: 'var(--color-primary-dim)' },
        '.border-primary':             { borderColor: 'var(--color-primary)' },
        '.ring-primary':               { '--tw-ring-color': 'var(--color-primary)' },

        '.background-secondary':       { backgroundColor: 'var(--color-secondary)' },
        '.background-secondary-soft':  { backgroundColor: 'var(--color-secondary-soft)' },
        '.foreground-secondary':       { color: 'var(--color-secondary)' },
        '.foreground-secondary-dim':   { color: 'var(--color-secondary-dim)' },

        '.background-accent':          { backgroundColor: 'var(--color-accent)' },
        '.background-accent-soft':     { backgroundColor: 'var(--color-accent-soft)' },
        '.foreground-accent':          { color: 'var(--color-accent)' },
        '.foreground-accent-dim':      { color: 'var(--color-accent-dim)' },

        '.background-surface':         { backgroundColor: 'var(--color-surface)' },
        '.background-surface-raised':  { backgroundColor: 'var(--color-surface-raised)' },
        '.background-canvas':          { backgroundColor: 'var(--color-canvas)' },
        '.foreground-content':         { color: 'var(--color-content)' },
        '.foreground-subtle':          { color: 'var(--color-subtle)' },
        '.foreground-dim':             { color: 'var(--color-dim)' },
        '.border-line':                { borderColor: 'var(--color-line)' },
        '.border-divider':             { borderColor: 'var(--color-divider)' },
        '.divide-divider > :not([hidden]) ~ :not([hidden])': {
          borderColor: 'var(--color-divider)',
        },
      })
    }),
  ],
}
