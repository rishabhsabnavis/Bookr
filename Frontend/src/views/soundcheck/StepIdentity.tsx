import { TextField } from '../../components/soundcheck/TextField';
import { Dropzone } from '../../components/soundcheck/Dropzone';
import { SectionLabel } from '../../components/soundcheck/SectionLabel';
import type { SoundcheckData } from '../../types/soundcheck';

interface Props {
  data: SoundcheckData;
  set: (k: keyof SoundcheckData, v: unknown) => void;
}

export function StepIdentity({ data, set }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26, maxWidth: 640 }}>
      <TextField
        label="Stage name"
        value={data.name}
        onChange={(v) => set('name', v)}
        placeholder="e.g. DJ Aanya"
      />
      <TextField
        label="One-line bio"
        multiline rows={3}
        value={data.bio}
        onChange={(v) => set('bio', v)}
        placeholder="Bollywood-house selector turning weddings into warehouse parties."
        hint={`${data.bio.length}/180 · USED VERBATIM IN PITCHES`}
      />
      <div>
        <SectionLabel>Electronic press kit</SectionLabel>
        <Dropzone
          file={data.epk}
          onPick={() => set('epk', 'EPK-2026.pdf')}
          onClear={() => set('epk', null)}
        />
      </div>
    </div>
  );
}
