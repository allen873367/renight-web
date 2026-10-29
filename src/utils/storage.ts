import { SleepProfile, MorningCheckin } from '../types/sleep';

const PROFILE_KEY = 'renight_sleep_profile';
const CHECKIN_KEY = 'renight_checkin_history';

export class StorageService {
  static getProfile(): SleepProfile | null {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (!data) return null;
      return JSON.parse(data) as SleepProfile;
    } catch {
      return null;
    }
  }

  static saveProfile(profile: SleepProfile): void {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save profile to localStorage', e);
    }
  }

  static getCheckinHistory(): MorningCheckin[] {
    try {
      const data = localStorage.getItem(CHECKIN_KEY);
      if (!data) return [];
      return JSON.parse(data) as MorningCheckin[];
    } catch {
      return [];
    }
  }

  static hasCheckedInToday(): boolean {
    const today = new Date().toISOString().split('T')[0];
    const history = this.getCheckinHistory();
    return history.some((item) => item.date === today);
  }

  static saveCheckin(stars: number, note = ''): void {
    try {
      const today = new Date().toISOString().split('T')[0];
      const history = this.getCheckinHistory().filter((item) => item.date !== today);
      const newEntry: MorningCheckin = {
        date: today,
        stars,
        note,
        timestamp: Date.now()
      };
      history.unshift(newEntry);
      localStorage.setItem(CHECKIN_KEY, JSON.stringify(history.slice(0, 30)));
    } catch (e) {
      console.warn('Failed to save checkin to localStorage', e);
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem(CHECKIN_KEY);
    } catch {
      // ignore
    }
  }
}
