// Bookr Dashboard — mock data. Mirrors the MongoDB schemas in uploads/CLAUDE.md
// (call_logs + venue profiles). Exposed on window for the dashboard views.

// Outcome enum from the spec: booked | hold | declined | voicemail | no_answer | wrong_number
const DASH_DJ = {
  name: 'DJ Aanya',
  genres: ['Afrobeats', 'Amapiano', 'House'],
  bpm: '110–128',
  cities: ['Brooklyn', 'Los Angeles'],
  rateMin: 1200,
};

// Two-speaker transcript turns: { who: 'agent' | 'buyer', text }
const T_ELSEWHERE = [
  { who: 'agent', text: "Hi — is this the booking line for Elsewhere? I'm calling on behalf of DJ Aanya." },
  { who: 'buyer', text: "Yeah, this is the talent desk. What's this about?" },
  { who: 'agent', text: "Aanya's a Brooklyn-based Afrobeats and amapiano selector — she played the Gobi tent at Coachella and a Boiler Room set last fall. We think the Zone One room would be a great fit." },
  { who: 'buyer', text: "We're pretty booked through the spring, honestly." },
  { who: 'agent', text: "Totally understand. Would a Thursday residency slot or a future Friday work? She's flexible on dates and travels light — just needs CDJs and a mixer.", objection: 'Fully booked' },
  { who: 'buyer', text: "...A Thursday could actually work. We've got May 14th open." },
  { who: 'agent', text: "May 14th is perfect. Her rate for a Thursday is fourteen hundred. Can I put a soft hold on that date and send her mixes over?" },
  { who: 'buyer', text: "Sure, put a hold on the 14th and send the SoundCloud. I'll run it by the team." },
  { who: 'agent', text: "Done — holding May 14th at fourteen hundred. You'll have the mixes in your inbox in two minutes. Thanks so much." },
];

const T_HOY = [
  { who: 'agent', text: "Hi, I'm calling for DJ Aanya — is this the right line to pitch a DJ for House of Yes?" },
  { who: 'buyer', text: "It is. We're selective but go ahead." },
  { who: 'agent', text: "Aanya does high-energy Afrobeats-meets-house — costume-friendly, very dancefloor. She closed a 900-cap room at Elsewhere last month." },
  { who: 'buyer', text: "Ooh, that's our crowd. What dates is she looking at?" },
  { who: 'agent', text: "She's got Fridays open in May. The 22nd or the 29th would both work." },
  { who: 'buyer', text: "Let me pencil the 22nd. We'd do sixteen hundred for a Friday headline-support slot." },
  { who: 'agent', text: "Sixteen hundred on Friday the 22nd — I'll hold that and loop her in for approval. Thank you!" },
];

const T_SOUND = [
  { who: 'agent', text: "Hi — calling on behalf of DJ Aanya for Sound Nightclub in Los Angeles." },
  { who: 'buyer', text: "Go ahead." },
  { who: 'agent', text: "Aanya plays Afrobeats and amapiano in the 110 to 128 range — perfect for your Saturday main-room energy. She's relocating sets to LA this summer." },
  { who: 'buyer', text: "We don't usually take cold pitches for Saturdays." },
  { who: 'agent', text: "Makes sense — I'm not after a permanent slot, just one showcase Saturday to see how the room responds. Happy to do it at a fair rate.", objection: 'Not hiring DJs' },
  { who: 'buyer', text: "Alright — June 6th is open. We'd be at two thousand for an opening set." },
  { who: 'agent', text: "June 6th at two thousand — I'll place a hold and get Aanya's approval. Appreciate it." },
];

const T_GOODROOM = [
  { who: 'agent', text: "Hi, calling for DJ Aanya — pitching a date at Good Room." },
  { who: 'buyer', text: "We're fully programmed through August, sorry." },
  { who: 'agent', text: "No problem at all — could I check back in for the fall, or leave her mixes for your files?", objection: 'Fully booked' },
  { who: 'buyer', text: "Send the mixes, we'll keep her on the radar. No dates right now though." },
  { who: 'agent', text: "Will do — thanks for the time." },
];

const T_PUBLIC = [
  { who: 'agent', text: "Hi, you've reached the voicemail tone — leaving a quick note for the Public Records booking team." },
  { who: 'agent', text: "This is a message for DJ Aanya — Brooklyn Afrobeats and house selector, recently at Elsewhere and Boiler Room. Looking for a spring date in your listening room. Mixes and EPK are headed to your inbox. Thanks!" },
];

const CALLS = [
  { id: 'c1', venue: 'Elsewhere', city: 'Brooklyn', type: 'Nightclub', contact: 'Talent Desk', phone: '+1 (718) 555-0114', when: 'Today · 2:41 PM', dur: 184, outcome: 'hold', sentiment: 0.72, hold: { date: 'Thu · May 14', rate: 1400, slot: 'Zone One · Thursday' }, follow: 'Send SoundCloud + EPK (auto-sent)', transcript: T_ELSEWHERE, fit: 94 },
  { id: 'c2', venue: 'House of Yes', city: 'Brooklyn', type: 'Nightclub', contact: 'Kae M.', phone: '+1 (718) 555-0188', when: 'Today · 2:08 PM', dur: 142, outcome: 'hold', sentiment: 0.85, hold: { date: 'Fri · May 22', rate: 1600, slot: 'Friday · Headline support' }, follow: 'Confirm costume theme for the night', transcript: T_HOY, fit: 91 },
  { id: 'c3', venue: 'Sound Nightclub', city: 'Los Angeles', type: 'Nightclub', contact: 'Booking', phone: '+1 (323) 555-0143', when: 'Today · 1:52 PM', dur: 167, outcome: 'hold', sentiment: 0.64, hold: { date: 'Sat · Jun 6', rate: 2000, slot: 'Saturday · Opening set' }, follow: 'Provide tech rider for main room', transcript: T_SOUND, fit: 88 },
  { id: 'c4', venue: 'Nowadays', city: 'Brooklyn', type: 'Nightclub', contact: 'Programming', phone: '+1 (718) 555-0156', when: 'Today · 1:30 PM', dur: 203, outcome: 'booked', sentiment: 0.9, hold: { date: 'Sun · May 18', rate: 1300, slot: 'Sunday · Nonsense daytime' }, follow: 'Contract sent · countersigned', transcript: T_HOY, fit: 90 },
  { id: 'c5', venue: 'Good Room', city: 'Brooklyn', type: 'Nightclub', contact: 'Booking', phone: '+1 (718) 555-0170', when: 'Today · 1:11 PM', dur: 64, outcome: 'declined', sentiment: -0.1, follow: 'Re-pitch for fall season (Sep)', transcript: T_GOODROOM, fit: 76 },
  { id: 'c6', venue: 'Public Records', city: 'Brooklyn', type: 'Bar / Lounge', contact: 'Voicemail', phone: '+1 (718) 555-0191', when: 'Today · 12:58 PM', dur: 22, outcome: 'voicemail', sentiment: 0, follow: 'Auto-retry in 48h', transcript: T_PUBLIC, fit: 71 },
  { id: 'c7', venue: 'Mansions', city: 'Los Angeles', type: 'Bar / Lounge', contact: '—', phone: '+1 (323) 555-0125', when: 'Today · 12:40 PM', dur: 0, outcome: 'no_answer', sentiment: 0, follow: 'Auto-retry tomorrow AM', transcript: [], fit: 68 },
  { id: 'c8', venue: 'The Echo', city: 'Los Angeles', type: 'Nightclub', contact: 'Spaceland', phone: '+1 (213) 555-0137', when: 'Today · 12:22 PM', dur: 38, outcome: 'declined', sentiment: -0.2, follow: 'Not a DJ room — archive', transcript: T_GOODROOM, fit: 62 },
  { id: 'c9', venue: 'Zebulon', city: 'Los Angeles', type: 'Bar / Lounge', contact: 'Voicemail', phone: '+1 (323) 555-0109', when: 'Today · 12:05 PM', dur: 19, outcome: 'voicemail', sentiment: 0, follow: 'Auto-retry in 48h', transcript: T_PUBLIC, fit: 66 },
  { id: 'c10', venue: 'Gold Diggers', city: 'Los Angeles', type: 'Bar / Lounge', contact: '—', phone: '+1 (323) 555-0100', when: 'Today · 11:48 AM', dur: 6, outcome: 'wrong_number', sentiment: 0, follow: 'Flag contact for re-scrape', transcript: [], fit: 59 },
];

// The call playing in the "Watch live" view.
const LIVE_CALL = {
  venue: 'Paragon', city: 'Brooklyn', type: 'Nightclub', contact: 'Talent Buyer',
  phone: '+1 (718) 555-0162', fit: 89,
  transcript: [
    { who: 'agent', text: "Hi — is this the booking line for Paragon? I'm calling on behalf of DJ Aanya." },
    { who: 'buyer', text: "Speaking. What've you got?" },
    { who: 'agent', text: "Aanya's a Brooklyn Afrobeats and amapiano selector — Coachella's Gobi tent, a Boiler Room set, and a sold-out night at Elsewhere last month." },
    { who: 'buyer', text: "Nice résumé. But our calendar's tight right now." },
    { who: 'agent', text: "Understood — would a Thursday or a future Friday work? She's flexible on dates and easy on the tech side.", objection: 'Fully booked' },
    { who: 'buyer', text: "A Thursday's doable. What's she asking?" },
    { who: 'agent', text: "Fourteen hundred for a Thursday headline. Could I put a soft hold on a date and send her mixes?" },
    { who: 'buyer', text: "Let's hold May 28th. Send everything over." },
    { who: 'agent', text: "Holding May 28th at fourteen hundred — mixes and EPK on the way. Thank you!" },
  ],
};

Object.assign(window, { DASH_DJ, CALLS, LIVE_CALL });
