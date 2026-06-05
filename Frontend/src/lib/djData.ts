import type { SoundcheckData } from '../types/soundcheck';

export const MOCK_DJ = {
  name: 'RISH',
  genres: ['Hip-Hop', 'Afrobeats', 'Bollywood', 'R&B'],
  cities: ['St. Louis', 'Chicago', 'New York', 'Dallas'],
  rateMin: 500,
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
