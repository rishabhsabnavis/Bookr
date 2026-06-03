import { TextField } from '../../components/soundcheck/TextField';
import { SectionLabel } from '../../components/soundcheck/SectionLabel';
import { Mono } from '../../components/primitives/Mono';
import type { SoundcheckData } from '../../types/soundcheck';

interface Props {
  data: SoundcheckData;
  set: (k: keyof SoundcheckData, v: unknown) => void;
}

function upcomingWeekends() {
  const base = new Date(2026, 5, 1);
  const days: Date[] = [];
  for (let i = 0; i < 28 && days.length < 9; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    if (d.getDay() === 5 || d.getDay() === 6) days.push(d);
  }
  return days;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dateKey = (d: Date) => `${d.getMonth()}-${d.getDate()}`;
const WEEKEND_DAYS = upcomingWeekends();

export function StepLogistics({ data, set }: Props) {
  const toggleDate = (k: string) =>
    set('dates', data.dates.includes(k) ? data.dates.filter((x) => x !== k) : [...data.dates, k]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 720 }}>
      <div>
        <SectionLabel right={<Mono style={{ color: 'var(--muted)' }}>{data.dates.length} NIGHTS OPEN</Mono>}>
          Availability — upcoming weekends
        </SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {WEEKEND_DAYS.map((d) => {
            const k = dateKey(d);
            const on = data.dates.includes(k);
            return (
              <button key={k} onClick={() => toggleDate(k)} style={{ width: 76, padding: '12px 0', borderRadius: 14, cursor: 'pointer', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', textAlign: 'center', background: on ? 'var(--accent)' : 'var(--surface)', border: `1.5px solid ${on ? 'var(--accent)' : 'var(--line)'}`, transition: 'all .14s' }}>
                <Mono style={{ color: on ? 'var(--on-accent)' : 'var(--muted)', display: 'block' }}>{DAYS[d.getDay()]}</Mono>
                <span style={{ display: 'block', fontSize: 22, fontWeight: 700, color: on ? 'var(--on-accent)' : 'var(--ink)', lineHeight: 1.2 }}>{d.getDate()}</span>
                <Mono style={{ color: on ? 'var(--on-accent)' : 'var(--faint)', display: 'block', fontSize: 10 }}>{MONTHS[d.getMonth()].toUpperCase()}</Mono>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: '20px 22px' }}>
          <SectionLabel right={<Mono style={{ color: 'var(--accent)', fontSize: 14, fontWeight: 600 }}>${data.rate.toLocaleString()}+</Mono>}>
            Minimum fee / night
          </SectionLabel>
          <input type="range" min={250} max={5000} step={50} value={data.rate}
            onChange={(e) => set('rate', Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent)', margin: '8px 0' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <Mono style={{ color: 'var(--muted)' }}>$250</Mono>
            <Mono style={{ color: 'var(--muted)' }}>$5,000</Mono>
          </div>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <TextField
            label="Past gigs — social proof for the call"
            multiline rows={2}
            value={data.pastGigs}
            onChange={(v) => set('pastGigs', v)}
            placeholder="Opened for Black Coffee at Output, residency at Elsewhere Rooftop…"
            optional
          />
        </div>
      </div>
    </div>
  );
}
