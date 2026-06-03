import { useState } from 'react';
import { LiveDot } from '../primitives/LiveDot';
import { Mono } from '../primitives/Mono';

interface DropzoneProps {
  file: string | null;
  onPick: () => void;
  onClear: () => void;
}

export function Dropzone({ file, onPick, onClear }: DropzoneProps) {
  const [hover, setHover] = useState(false);

  if (file) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '15px 17px', borderRadius: 14, border: '1px solid var(--line)', background: 'var(--surface)' }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 40px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{file}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 3 }}>
            <LiveDot color="#3FBF7F" size={6} />
            <Mono style={{ color: 'var(--muted)' }}>PARSED · 2 PAGES · READY FOR PITCHES</Mono>
          </div>
        </div>
        <button onClick={onClear} style={{ border: 'none', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontSize: 13, fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontWeight: 600 }}>
          Replace
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onPick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', padding: 26, borderRadius: 14, cursor: 'pointer',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        border: `1.5px dashed ${hover ? 'var(--accent)' : 'var(--line)'}`,
        background: hover ? 'var(--accent-soft)' : 'var(--surface2)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        transition: 'all .15s',
      }}
    >
      <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M5 21h14"/>
        </svg>
      </div>
      <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>Drop your EPK, or click to upload</div>
      <Mono style={{ color: 'var(--muted)' }}>PDF · WE EXTRACT YOUR BIO &amp; STATS</Mono>
    </button>
  );
}
