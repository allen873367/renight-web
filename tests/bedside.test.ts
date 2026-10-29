import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BedsideClockComponent } from '../src/components/BedsideClock';
import { SoundEngine } from '../src/audio/engine';
import { SleepProfile } from '../src/types/sleep';

describe('Bedside Clock Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('renders wall clock and countdown correctly', () => {
    const engine = new SoundEngine();
    const profile: SleepProfile = {
      issueType: 'falling-asleep',
      durationMinutes: 30,
      soundscape: 'rain',
      beatVolume: 0.7,
      soundscapeVolume: 0.5,
      lastUpdated: Date.now()
    };
    engine.start(profile);

    const container = document.createElement('div');
    document.body.appendChild(container);

    const onExit = vi.fn();
    const bedside = new BedsideClockComponent(engine);
    bedside.render(container, onExit);

    expect(container.innerHTML).toContain('bedside-wall-clock');
    expect(container.innerHTML).toContain('bedside-timer');

    bedside.updateState(engine.getState());

    const timerElem = container.querySelector('#bedside-timer');
    expect(timerElem?.textContent).toBe('30:00');

    // Click exit button
    const exitBtn = container.querySelector<HTMLButtonElement>('#btn-stop-exit');
    exitBtn?.click();
    expect(onExit).toHaveBeenCalledTimes(1);

    bedside.destroy();
  });
});
