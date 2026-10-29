export class WakeLockService {
  private static sentinel: any = null;
  private static isRequested = false;

  public static async requestLock(): Promise<void> {
    this.isRequested = true;
    if (!('wakeLock' in navigator)) return;

    try {
      this.sentinel = await (navigator as any).wakeLock.request('screen');
      this.sentinel.addEventListener('release', () => {
        this.sentinel = null;
        if (this.isRequested && document.visibilityState === 'visible') {
          this.requestLock();
        }
      });
    } catch (err) {
      console.warn('Wake Lock request failed or not supported:', err);
    }
  }

  public static async releaseLock(): Promise<void> {
    this.isRequested = false;
    if (this.sentinel) {
      try {
        await this.sentinel.release();
      } catch {
        // ignore
      }
      this.sentinel = null;
    }
  }
}
