import { describe, it, expect } from 'vitest';
import { calculateFrequencies, getFadeGain } from '../src/audio/math';

describe('Audio Math Engine', () => {
  it('calculates falling-asleep curve from Alpha (10Hz) to Delta (2Hz)', () => {
    // At start (elapsed = 0), beat frequency should be ~10 Hz (Alpha)
    const start = calculateFrequencies('falling-asleep', 0, 1800);
    expect(start.beat).toBeCloseTo(10, 1);
    expect(start.carrier).toBeGreaterThanOrEqual(108);

    // At middle (elapsed = 900), beat frequency should be in Theta (~5-6 Hz)
    const mid = calculateFrequencies('falling-asleep', 900, 1800);
    expect(mid.beat).toBeLessThan(10);
    expect(mid.beat).toBeGreaterThan(3);

    // At end (elapsed = 1800), beat frequency should be Delta (~2 Hz)
    const end = calculateFrequencies('falling-asleep', 1800, 1800);
    expect(end.beat).toBeCloseTo(2, 0.5);
  });

  it('calculates shallow-sleep curve as steady Delta wave (1.8-2.5 Hz)', () => {
    const start = calculateFrequencies('shallow-sleep', 0, 3600);
    expect(start.beat).toBeLessThanOrEqual(2.5);
    expect(start.beat).toBeGreaterThanOrEqual(1.5);

    const mid = calculateFrequencies('shallow-sleep', 1800, 3600);
    expect(mid.beat).toBeLessThanOrEqual(2.5);
    expect(mid.beat).toBeGreaterThanOrEqual(1.5);
  });

  it('calculates 10-minute fade-out gain curve properly', () => {
    const fadeDuration = 600; // 10 minutes in seconds

    // Well before fade starts (e.g. 1000s remaining), gain is 1.0
    expect(getFadeGain(1000, fadeDuration)).toBe(1.0);

    // Halfway through fade (300s remaining), gain is between 0 and 1
    const halfGain = getFadeGain(300, fadeDuration);
    expect(halfGain).toBeGreaterThan(0);
    expect(halfGain).toBeLessThan(1.0);

    // At 0s remaining, gain is 0
    expect(getFadeGain(0, fadeDuration)).toBe(0);
  });
});
