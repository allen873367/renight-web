export type SleepIssueType = 'falling-asleep' | 'shallow-sleep';

export type SoundscapeType = 'rain' | 'fireplace' | 'pink-noise' | 'brown-noise' | 'silent';

export interface SleepProfile {
  issueType: SleepIssueType;
  durationMinutes: number; // e.g. 30, 45, 60, 90, 480 (all-night)
  soundscape: SoundscapeType;
  beatVolume: number; // 0.0 to 1.0
  soundscapeVolume: number; // 0.0 to 1.0
  lastUpdated: number;
}

export interface MorningCheckin {
  date: string; // YYYY-MM-DD
  stars: number; // 1 to 5
  note?: string;
  timestamp: number;
}

export type BrainwaveBand = 'Alpha' | 'Theta' | 'Delta';

export interface FreqResult {
  carrier: number;
  beat: number;
  band: BrainwaveBand;
}
