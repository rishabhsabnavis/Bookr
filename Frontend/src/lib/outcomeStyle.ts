import type { Outcome } from '../types/calls';

export interface OutcomeStyle {
  c: string;
  bg: string;
  label: string;
}

export function outcomeStyle(outcome: Outcome | string): OutcomeStyle {
  const map: Record<string, OutcomeStyle> = {
    booked:       { c: '#3FBF7F', bg: 'rgba(63,191,127,0.14)',             label: 'BOOKED' },
    hold:         { c: 'var(--accent)', bg: 'var(--accent-soft)',           label: 'HOLD' },
    declined:     { c: 'var(--muted)',  bg: 'var(--inset)',                 label: 'DECLINED' },
    voicemail:    { c: '#6C8FE0',       bg: 'rgba(108,143,224,0.13)',       label: 'VOICEMAIL' },
    no_answer:    { c: 'var(--faint)',  bg: 'var(--inset)',                 label: 'NO ANSWER' },
    wrong_number: { c: 'var(--faint)',  bg: 'var(--inset)',                 label: 'WRONG NUMBER' },
  };
  return map[outcome] ?? map.no_answer;
}
