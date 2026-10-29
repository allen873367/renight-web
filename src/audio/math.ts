import { BrainwaveBand, FreqResult, SleepIssueType } from '../types/sleep';

/**
 * Carrier frequency standard: 110 Hz - 136 Hz provides a soothing, warm sine wave
 * without harsh high harmonics or excessive sub-bass distortion on phone speakers.
 */
export const DEFAULT_CARRIER_FREQ = 120; // Hz

/**
 * Calculates carrier frequency and entrainment beat frequency based on sleep issue type and progression.
 *
 * Falling asleep curve:
 * - 0% - 25% of time: Alpha (10 Hz down to 7.5 Hz) -> Relaxation
 * - 25% - 60% of time: Theta (7.5 Hz down to 4.5 Hz) -> Drowsiness & Sleep transition
 * - 60% - 100% of time: Delta (4.5 Hz down to 2.0 Hz) -> Slow-wave deep sleep
 *
 * Shallow sleep curve:
 * - Steady Delta slow wave entrainment: 1.8 Hz - 2.2 Hz throughout the duration.
 */
export function calculateFrequencies(
  issueType: SleepIssueType,
  elapsedSeconds: number,
  totalSeconds: number
): FreqResult {
  const safeTotal = Math.max(totalSeconds, 1);
  const progress = Math.min(Math.max(elapsedSeconds / safeTotal, 0), 1);

  let beat = 2.0;
  let band: BrainwaveBand = 'Delta';

  if (issueType === 'falling-asleep') {
    if (progress < 0.25) {
      // Alpha phase: 10.0 -> 7.5 Hz
      const p = progress / 0.25;
      beat = 10.0 - p * 2.5;
      band = 'Alpha';
    } else if (progress < 0.6) {
      // Theta phase: 7.5 -> 4.0 Hz
      const p = (progress - 0.25) / 0.35;
      beat = 7.5 - p * 3.5;
      band = 'Theta';
    } else {
      // Delta phase: 4.0 -> 2.0 Hz
      const p = (progress - 0.6) / 0.4;
      beat = 4.0 - p * 2.0;
      band = 'Delta';
    }
  } else {
    // Shallow sleep: steady Delta slow wave to protect deep sleep
    beat = 2.0 - 0.2 * Math.sin(progress * Math.PI); // subtle 1.8 - 2.0 Hz fluctuation
    band = 'Delta';
  }

  return {
    carrier: DEFAULT_CARRIER_FREQ,
    beat: Number(beat.toFixed(2)),
    band
  };
}

/**
 * Calculates the fade gain multiplier for smooth 10-minute fade-out before timer ends.
 * @param remainingSeconds Time left on the timer in seconds
 * @param fadeDuration Duration of fade in seconds (default 600s = 10 min)
 * @returns gain multiplier between 0.0 and 1.0
 */
export function getFadeGain(remainingSeconds: number, fadeDuration = 600): number {
  if (remainingSeconds <= 0) return 0;
  if (remainingSeconds >= fadeDuration) return 1.0;

  // Smooth S-curve (cosine interpolation) for gentle, imperceptible decay
  const ratio = remainingSeconds / fadeDuration;
  return 0.5 * (1 - Math.cos(ratio * Math.PI));
}
