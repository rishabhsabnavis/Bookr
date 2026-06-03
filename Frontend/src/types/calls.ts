export type Outcome =
  | 'booked'
  | 'hold'
  | 'declined'
  | 'voicemail'
  | 'no_answer'
  | 'wrong_number';

export type HoldStatus = 'pending' | 'booked' | 'declined';

export interface Turn {
  who: 'agent' | 'buyer';
  text: string;
  objection?: string;
}

export interface HoldTerms {
  date: string;
  rate: number;
  slot: string;
}

export interface Call {
  id: string;
  venue: string;
  city: string;
  type: string;
  contact: string;
  phone: string;
  when: string;
  durationSeconds: number;
  outcome: Outcome;
  sentiment: number;
  fit: number;
  hold?: HoldTerms;
  followUp?: string;
  transcript: Turn[];
  recordingUrl?: string;
  holdApproved?: boolean | null;
}
