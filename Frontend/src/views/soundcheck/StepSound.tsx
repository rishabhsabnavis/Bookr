import { useState } from 'react';
import { SectionLabel } from '../../components/soundcheck/SectionLabel';
import { Chip } from '../../components/soundcheck/Chip';
import { DualRange } from '../../components/soundcheck/DualRange';
import { EqBars } from '../../components/primitives/EqBars';
import { Mono } from '../../components/primitives/Mono';
import type { SoundcheckData } from '../../types/soundcheck';

const ALL_GENRES = ['Afrobeats', 'Amapiano', 'House', 'Bollywood', 'Hip-Hop', 'Disco', 'Bass', 'Techno', 'Garage', 'Funk', 'R&B', 'Baile Funk'];

interface Props {
  data: SoundcheckData;
  set: (k: keyof SoundcheckData, v: unknown) => void;
}

const card: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--line)',
  borderRadius: 14, padding: '20px 22px',
};

export function StepSound({ data, set }: Props) {
  const [link, setLink] = useState('');

  const toggleGenre = (g: string) =>
    set('genres', data.genres.includes(g) ? data.genres.filter((x) => x !== g) : [...data.genres, g]);

  const addLink = () => {
    if (!link.trim()) return;
    const platform = /mixcloud/i.test(link) ? 'Mixcloud' : /spotify/i.test(link) ? 'Spotify' : 'SoundCloud';
    set('mixes', [...data.mixes, { platform, url: link.trim() }]);
    setLink('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      <div>
        <SectionLabel right={<Mono style={{ color: 'var(--muted)' }}>{data.genres.length} SELECTED</Mono>}>
          Genre tags
        </SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
          {ALL_GENRES.map((g) => (
            <Chip key={g} on={data.genres.includes(g)} onClick={() => toggleGenre(g)}>{g}</Chip>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'start' }}>
        <div style={card}>
          <SectionLabel right={<Mono style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 600 }}>{data.bpmLo}–{data.bpmHi} BPM</Mono>}>
            Tempo range
          </SectionLabel>
          <DualRange
            min={60} max={180}
            lo={data.bpmLo} hi={data.bpmHi}
            onChange={(lo, hi) => { set('bpmLo', lo); set('bpmHi', hi); }}
          />
        </div>

        <div style={card}>
          <SectionLabel>Mix links</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {data.mixes.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px', borderRadius: 10, background: 'var(--inset)', border: '1px solid var(--line2)' }}>
                <EqBars bars={4} color="var(--accent)" h={15} w={2.5} gap={2.5} seed={i} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>{m.platform}</div>
                  <Mono style={{ color: 'var(--muted)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.url}</Mono>
                </div>
                <button onClick={() => set('mixes', data.mixes.filter((_, j) => j !== i))} style={{ border: 'none', background: 'transparent', color: 'var(--faint)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 4 }}>×</button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={link} onChange={(e) => setLink(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addLink()}
                placeholder="Paste SoundCloud / Mixcloud link"
                style={{ flex: 1, minWidth: 0, fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: 13.5, color: 'var(--ink)', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, padding: '0 13px', height: 40, outline: 'none' }}
              />
              <button onClick={addLink} style={{ flex: '0 0 auto', padding: '0 16px', height: 40, borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink2)', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
