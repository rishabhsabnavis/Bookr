export interface MixLink {
  platform: string;
  url: string;
}

export interface SoundcheckData {
  name: string;
  bio: string;
  epk: string | null;
  genres: string[];
  bpmLo: number;
  bpmHi: number;
  mixes: MixLink[];
  cities: string[];
  venues: string[];
  dates: string[];
  rate: number;
  pastGigs: string;
}

export const DEFAULT_DATA: SoundcheckData = {
  name: '', bio: '', epk: null,
  genres: [], bpmLo: 110, bpmHi: 128,
  mixes: [], cities: [], venues: [],
  dates: [], rate: 1200, pastGigs: '',
};
