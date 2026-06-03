import { useState, useEffect } from 'react';
import { StaticWave } from './StaticWave';
import { Mono } from './primitives/Mono';
import { fmtDur } from '../lib/fmtDur';

interface RecorderProps {
  durationSeconds: number;
}

export function Recorder({ durationSeconds: dur }: RecorderProps) {
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(() => {
      setPos((p) => {
        if (p >= dur) { setPlaying(false); return dur; }
        return p + 0.5;
      });
    }, 120);
    return () => clearInterval(iv);
  }, [playing, dur]);

  const progress = dur ? pos / dur : 0;

  const handlePlay = () => {
    if (pos >= dur) setPos(0);
    setPlaying((p) => !p);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setPos(ratio * dur);
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px', borderRadius: 14,
      background: 'var(--surface)', border: '1px solid var(--line)',
      marginBottom: 20,
    }}>
      {/* play / pause */}
      <button
        onClick={handlePlay}
        style={{
          flex: '0 0 42px', width: 42, height: 42, borderRadius: '50%',
          border: 'none', background: 'var(--accent)', color: 'var(--on-accent)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {playing
          ? <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1"/>
              <rect x="14" y="5" width="4" height="14" rx="1"/>
            </svg>
          : <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 5v14l12-7z"/>
            </svg>
        }
      </button>

      {/* waveform */}
      <StaticWave h={34} progress={progress} onSeek={handleSeek} />

      {/* timecode */}
      <Mono style={{ color: 'var(--muted)', width: 84, textAlign: 'right', flexShrink: 0 }}>
        {fmtDur(Math.round(pos))} / {fmtDur(dur)}
      </Mono>
    </div>
  );
}
