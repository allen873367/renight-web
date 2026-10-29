import { describe, it, expect, vi } from 'vitest';
import { DashboardComponent } from '../src/components/Dashboard';
import { SoundEngine } from '../src/audio/engine';
import { SleepProfile } from '../src/types/sleep';

describe('Dashboard Component', () => {
  it('renders dashboard with profile summary and buttons', () => {
    const engine = new SoundEngine();
    const profile: SleepProfile = {
      issueType: 'falling-asleep',
      durationMinutes: 45,
      soundscape: 'rain',
      beatVolume: 0.7,
      soundscapeVolume: 0.5,
      lastUpdated: Date.now()
    };

    const container = document.createElement('div');
    document.body.appendChild(container);

    const onStart = vi.fn();
    const onEditProfile = vi.fn();

    const dashboard = new DashboardComponent(engine, profile);
    dashboard.render(container, { onStart, onEditProfile });

    expect(container.innerHTML).toContain('RENIGHT');
    expect(container.innerHTML).toContain('入睡困難引導');
    expect(container.innerHTML).toContain('開始好眠');

    const startBtn = container.querySelector<HTMLButtonElement>('#btn-start-sleep');
    startBtn?.click();
    expect(onStart).toHaveBeenCalledTimes(1);

    const editBtn = container.querySelector<HTMLButtonElement>('#btn-edit-profile');
    editBtn?.click();
    expect(onEditProfile).toHaveBeenCalledTimes(1);
  });
});
