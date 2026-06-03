import { useState } from 'react';
import { Mono } from '../primitives/Mono';

interface TextFieldProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  hint?: string;
  optional?: boolean;
  prefix?: string;
}

export function TextField({ label, value, onChange, placeholder, multiline, rows = 3, hint, optional, prefix }: TextFieldProps) {
  const [focus, setFocus] = useState(false);

  const base: React.CSSProperties = {
    width: '100%',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: 15, color: 'var(--ink)',
    background: 'var(--surface)',
    border: `1px solid ${focus ? 'var(--accent)' : 'var(--line)'}`,
    borderRadius: 14,
    padding: multiline ? '13px 15px' : '0 15px',
    height: multiline ? 'auto' : 50,
    outline: 'none', resize: 'none' as const,
    lineHeight: multiline ? 1.55 : 'normal',
    boxShadow: focus ? '0 0 0 3px var(--accent-soft)' : 'none',
    transition: 'border-color .15s, box-shadow .15s',
  };

  return (
    <div>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
          <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{label}</label>
          {optional && <Mono style={{ color: 'var(--faint)' }}>OPTIONAL</Mono>}
          {hint && <Mono style={{ color: 'var(--muted)' }}>{hint}</Mono>}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {prefix && (
          <span style={{ marginRight: -39, zIndex: 1, paddingLeft: 15, color: 'var(--muted)', fontSize: 15, pointerEvents: 'none' }}>
            {prefix}
          </span>
        )}
        {multiline
          ? <textarea rows={rows} value={value} placeholder={placeholder}
              onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
              onChange={(e) => onChange(e.target.value)} style={base} />
          : <input value={value} placeholder={placeholder}
              onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
              onChange={(e) => onChange(e.target.value)}
              style={{ ...base, paddingLeft: prefix ? 39 : 15 }} />
        }
      </div>
    </div>
  );
}
