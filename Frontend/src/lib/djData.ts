import type { SoundcheckData } from '../types/soundcheck';

// Neutral defaults so the dashboard shows nothing fabricated before onboarding.
// Once a DJ onboards, getLiveDJ() reads their real profile from localStorage.
export const MOCK_DJ = {
  name: '',
  genres: [] as string[],
  cities: [] as string[],
  rateMin: 0,
};

export function getLiveDJ() {
  try {
    const raw = localStorage.getItem('bookr.data');
    if (!raw) return MOCK_DJ;
    const data: SoundcheckData = JSON.parse(raw);
    return {
      name: data.name || MOCK_DJ.name,
      genres: data.genres.length ? data.genres : MOCK_DJ.genres,
      cities: data.cities.length ? data.cities : MOCK_DJ.cities,
      rateMin: data.rate || MOCK_DJ.rateMin,
    };
  } catch {
    return MOCK_DJ;
  }
}
