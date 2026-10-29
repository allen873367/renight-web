import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SoundEngine } from '../src/audio/engine';
import { SleepProfile } from '../src/types/sleep';

describe('SoundEngine Web Audio', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('starts in idle status', () => {
    const engine = new SoundEngine();
    expect(engine.getState().status).toBe('idle');
  });

  it('transitions to playing status and ticks elapsed time', () => {
    const engine = new SoundEngine();
    const profile: SleepProfile = {
      issueType: 'falling-asleep',
      durationMinutes: 30,
      soundscape: 'pink-noise',
      beatVolume: 0.8,
      soundscapeVolume: 0.4,
      lastUpdated: Date.now()
    };

    let tickCount = 0;
    engine.onTick(() => {
      tickCount++;
    });

    engine.start(profile);
    expect(engine.getState().status).toBe('playing');
    expect(engine.getState().remainingSeconds).toBe(1800);

    // Fast forward 5 seconds
    vi.advanceTimersByTime(5000);
    expect(tickCount).toBeGreaterThanOrEqual(4);
    expect(engine.getState().elapsedSeconds).toBe(5);

    engine.stop();
    expect(engine.getState().status).toBe('idle');
  });

  it('adjusts volumes dynamically without throwing', () => {
    const engine = new SoundEngine();
    expect(() => {
      engine.setBeatVolume(0.5);
      engine.setSoundscapeVolume(0.3);
      engine.setSoundscapeTrack('brown-noise');
    }).not.toThrow();
  });
});
