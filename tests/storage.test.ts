import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../src/utils/storage';
import { SleepProfile } from '../src/types/sleep';

describe('Storage Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when no profile is saved', () => {
    expect(StorageService.getProfile()).toBeNull();
  });

  it('saves and retrieves sleep profile correctly', () => {
    const profile: SleepProfile = {
      issueType: 'falling-asleep',
      durationMinutes: 45,
      soundscape: 'rain',
      beatVolume: 0.7,
      soundscapeVolume: 0.5,
      lastUpdated: Date.now()
    };

    StorageService.saveProfile(profile);
    const retrieved = StorageService.getProfile();

    expect(retrieved).not.toBeNull();
    expect(retrieved?.issueType).toBe('falling-asleep');
    expect(retrieved?.durationMinutes).toBe(45);
    expect(retrieved?.soundscape).toBe('rain');
  });

  it('records morning check-in and prevents duplicate check-in same day', () => {
    expect(StorageService.hasCheckedInToday()).toBe(false);

    StorageService.saveCheckin(5, '睡得很沉');
    expect(StorageService.hasCheckedInToday()).toBe(true);

    const history = StorageService.getCheckinHistory();
    expect(history.length).toBe(1);
    expect(history[0].stars).toBe(5);
    expect(history[0].note).toBe('睡得很沉');
  });
});
