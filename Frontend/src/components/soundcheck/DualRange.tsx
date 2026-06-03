import { useRef, useEffect } from 'react';
import { Mono } from '../primitives/Mono';

interface DualRangeProps {
  min: number;
  max: number;
  lo: number;
  hi: number;
  onChange: (lo: number, hi: number) => void;
  unit?: string;
}

export function DualRange({ min, max, lo, hi, onChange, unit = '' }: DualRangeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<'lo' | 'hi' | null>(null);

  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!drag.current || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      let v = Math.round(min + Math.max(0, Math.min(1, x / rect.width)) * (max - min));
      if (drag.current === 'lo') onChange(Math.min(v, hi - 1), hi);
      else onChange(lo, Math.max(v, lo + 1));
    };
    const up = () => { drag.current = null; };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [lo, hi, min, max, onChange]);

  const thumb = (key: 'lo' | 'hi', v: number) => (
    <div
      onPointerDown={(e) => { e.preventDefault(); drag.current = key; }}
      style={{
        position: 'absolute', left: `${pct(v)}%`, top: '50%',
        transform: 'translate(-50%,-50%)',
        width: 22, height: 22, borderRadius: '50%',
        background: 'var(--surface)',
        border: '2.5px solid var(--accent)',
        boxShadow: '0 8px 22px -16px rgba(36,28,42,0.22)',
        cursor: 'grab', touchAction: 'none', zIndex: 2,
      }}
    />
  );

  return (
    <div>
      <div ref={ref} style={{ position: 'relative', height: 6, background: 'var(--inset)', borderRadius: 6, margin: '10px 0' }}>
        <div style={{ position: 'absolute', left: `${pct(lo)}%`, right: `${100 - pct(hi)}%`, top: 0, bottom: 0, background: 'var(--accent)', borderRadius: 6 }} />
        {thumb('lo', lo)}
        {thumb('hi', hi)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
        <Mono style={{ color: 'var(--muted)' }}>{min}{unit}</Mono>
        <Mono style={{ color: 'var(--muted)' }}>{max}{unit}</Mono>
      </div>
    </div>
  );
}
