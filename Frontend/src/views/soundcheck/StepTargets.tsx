import { useState } from 'react';
import { SectionLabel } from '../../components/soundcheck/SectionLabel';
import { Chip } from '../../components/soundcheck/Chip';
import { SelectCard } from '../../components/soundcheck/SelectCard';
import { Mono } from '../../components/primitives/Mono';
import type { SoundcheckData } from '../../types/soundcheck';

const SUGGESTIONS = ['Brooklyn', 'Los Angeles', 'London', 'Berlin', 'Austin', 'Miami', 'Toronto'];
const VENUE_TYPES = [
  { v: 'Nightclub',   s: 'LATE, HIGH-ENERGY' },
  { v: 'Bar / Lounge', s: 'EARLY SETS, VIBE' },
  { v: 'Wedding',     s: 'PRIVATE, PREMIUM' },
  { v: 'Corporate',   s: 'BRAND EVENTS' },
  { v: 'Festival',    s: 'STAGE SLOTS' },
  { v: 'University',  s: 'CAMPUS NIGHTS' },
];

interface Props {
  data: SoundcheckData;
  set: (k: keyof SoundcheckData, v: unknown) => void;
}

export function StepTargets({ data, set }: Props) {
  const [city, setCity] = useState('');

  const addCity = (c?: string) => {
    const v = (c ?? city).trim();
    if (!v || data.cities.includes(v) || data.cities.length >= 5) return;
    set('cities', [...data.cities, v]);
    setCity('');
  };

  const toggleVenue = (v: string) =>
    set('venues', data.venues.includes(v) ? data.venues.filter((x) => x !== v) : [...data.venues, v]);

  const suggestions = SUGGESTIONS.filter((c) => !data.cities.includes(c));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 720 }}>
      <div>
        <SectionLabel right={<Mono style={{ color: data.cities.length >= 5 ? 'var(--accent)' : 'var(--muted)' }}>{data.cities.length}/5 CITIES</Mono>}>
          Target cities
        </SectionLabel>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            value={city} onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCity()}
            placeholder="Add a city the agent should call into"
            style={{ flex: 1, fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: 14.5, color: 'var(--ink)', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: '0 15px', height: 50, outline: 'none' }}
          />
          <button onClick={() => addCity()} style={{ padding: '0 20px', borderRadius: 14, border: 'none', background: 'var(--accent)', color: 'var(--on-accent)', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Add
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
          {data.cities.map((c) => (
            <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 10px 8px 15px', borderRadius: 999, background: 'var(--accent)', color: 'var(--on-accent)', fontSize: 13.5, fontWeight: 600 }}>
              {c}
              <button onClick={() => set('cities', data.cities.filter((x) => x !== c))} style={{ border: 'none', background: 'rgba(0,0,0,0.15)', color: 'var(--on-accent)', width: 18, height: 18, borderRadius: '50%', cursor: 'pointer', fontSize: 13, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </span>
          ))}
          {data.cities.length < 5 && suggestions.slice(0, 4).map((c) => (
            <Chip key={c} dashed onClick={() => addCity(c)}>+ {c}</Chip>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel right={<Mono style={{ color: 'var(--muted)' }}>{data.venues.length} TYPES</Mono>}>
          Venue types
        </SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 11 }}>
          {VENUE_TYPES.map(({ v, s }) => (
            <SelectCard key={v} on={data.venues.includes(v)} onClick={() => toggleVenue(v)} label={v} sub={s} />
          ))}
        </div>
      </div>
    </div>
  );
}
