import { SoundEngine } from '../audio/engine';

export class MediaSessionService {
  public static setup(engine: SoundEngine): void {
    if (!('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Renight 腦波同步助眠',
        artist: '外放單耳節拍物理調製',
        album: '好眠空間'
      });

      navigator.mediaSession.setActionHandler('play', () => {
        engine.resume();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        engine.pause();
      });

      navigator.mediaSession.setActionHandler('stop', () => {
        engine.stop();
      });
    } catch (e) {
      console.warn('MediaSession setup not supported or denied', e);
    }
  }

  public static updatePlaybackState(state: 'playing' | 'paused' | 'none'): void {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = state;
    } catch {
      // ignore
    }
  }
}
