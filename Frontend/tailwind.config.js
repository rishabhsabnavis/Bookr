/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:          'var(--bg)',
        surface:     'var(--surface)',
        surface2:    'var(--surface2)',
        inset:       'var(--inset)',
        line:        'var(--line)',
        line2:       'var(--line2)',
        ink:         'var(--ink)',
        ink2:        'var(--ink2)',
        muted:       'var(--muted)',
        faint:       'var(--faint)',
        accent:      'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        'accent-line': 'var(--accent-line)',
        'on-accent': 'var(--on-accent)',
        success:     'var(--success)',
        voicemail:   'var(--voicemail)',
        negative:    'var(--negative)',
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', '"SF Mono"', 'Menlo', 'monospace'],
      },
      borderRadius: {
        bookr: '14px',
        pill:  '999px',
      },
      boxShadow: {
        sm:   '0 8px 22px -16px rgba(36,28,42,0.22)',
        card: '0 1px 0 rgba(255,255,255,0.8) inset, 0 18px 44px -26px rgba(36,28,42,0.30)',
      },
      animation: {
        eq:    'bookrEq var(--eq-dur,0.7s) ease-in-out var(--eq-delay,0s) infinite',
        ping2: 'bookrPing 1.8s cubic-bezier(0,0,.2,1) infinite',
        pulse2:'bookrPulse 2s ease infinite',
        blink: 'bookrBlink 1s step-end infinite',
      },
    },
  },
  plugins: [],
};
