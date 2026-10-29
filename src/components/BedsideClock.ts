import { EngineState, SoundEngine } from '../audio/engine';
import { WakeLockService } from '../services/wakeLock';
import { MediaSessionService } from '../services/mediaSession';
import { Icons } from './Icons';

export class BedsideClockComponent {
  private engine: SoundEngine;
  private container: HTMLElement | null = null;
  private onExit: () => void = () => {};
  private clockTimer: number | null = null;
  private controlsTimeout: number | null = null;
  private showControls = false;

  constructor(engine: SoundEngine) {
    this.engine = engine;
  }

  public render(container: HTMLElement, onExit: () => void): void {
    this.container = container;
    this.onExit = onExit;

    WakeLockService.requestLock();
    MediaSessionService.setup(this.engine);
    MediaSessionService.updatePlaybackState('playing');

    this.renderDOM();
    this.startClock();
    this.bindEvents();
  }

  public updateState(state: EngineState): void {
    if (!this.container) return;

    if (state.status === 'idle') {
      this.destroy();
      this.onExit();
      return;
    }

    // Update remaining timer display
    const timerElem = this.container.querySelector<HTMLDivElement>('#bedside-timer');
    if (timerElem) {
      const mins = Math.floor(state.remainingSeconds / 60);
      const secs = state.remainingSeconds % 60;
      timerElem.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Update brainwave badge
    const waveElem = this.container.querySelector<HTMLSpanElement>('#bedside-wave');
    if (waveElem) {
      const fadeNotice = state.fadeGain < 1.0 ? ' (淡出中)' : '';
      waveElem.textContent = `${state.currentBand} ${state.currentBeatFreq} Hz${fadeNotice}`;
    }

    // Update pause/play button icon
    const playPauseBtn = this.container.querySelector<HTMLButtonElement>('#btn-toggle-play');
    if (playPauseBtn) {
      playPauseBtn.innerHTML = state.status === 'playing'
        ? Icons.Pause({ className: 'w-6 h-6' })
        : Icons.Play({ className: 'w-6 h-6 fill-current' });
    }
  }

  public destroy(): void {
    if (this.clockTimer !== null) {
      clearInterval(this.clockTimer);
      this.clockTimer = null;
    }
    if (this.controlsTimeout !== null) {
      clearTimeout(this.controlsTimeout);
      this.controlsTimeout = null;
    }
    WakeLockService.releaseLock();
    MediaSessionService.updatePlaybackState('none');
  }

  private renderDOM(): void {
    if (!this.container) return;
    const nowStr = this.getFormattedTime();

    this.container.innerHTML = `
      <div id="bedside-screen" class="relative w-full h-[100dvh] bg-black text-slate-400 select-none overflow-hidden flex flex-col justify-between items-center p-6 cursor-pointer">
        <!-- Floating Subtle Top Indicator -->
        <div class="flex items-center gap-2 text-xs text-slate-700 tracking-widest pt-2">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/60 animate-pulse"></span>
          <span id="bedside-wave">同步中...</span>
        </div>

        <!-- Dim Digital Clock in Center -->
        <div class="flex flex-col items-center justify-center my-auto">
          <div id="bedside-wall-clock" class="text-7xl sm:text-8xl font-extralight tracking-tight text-slate-600 font-mono">
            ${nowStr}
          </div>
          <div class="flex items-center gap-1.5 text-xs text-slate-700 font-mono mt-3">
            <span>倒數</span>
            <span id="bedside-timer" class="text-slate-500 font-medium">--:--</span>
          </div>
        </div>

        <!-- Touch Hint or Floating Controls -->
        <div id="bedside-controls-overlay" class="w-full max-w-xs transition-opacity duration-300 opacity-0 pointer-events-none pb-4">
          <div class="bg-slate-950/90 border border-slate-800/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-center justify-around">
            <button id="btn-toggle-play" class="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 active:scale-95 transition-all">
              ${Icons.Pause({ className: 'w-6 h-6' })}
            </button>
            <button id="btn-stop-exit" class="px-5 py-3 rounded-xl bg-red-950/40 border border-red-900/50 text-red-300 font-medium text-xs active:scale-95 transition-all">
              結束離開
            </button>
          </div>
        </div>

        <div id="bedside-hint" class="text-[11px] text-slate-800 pb-2 transition-opacity duration-300">
          輕觸螢幕喚出控制列 · 避免強光干擾
        </div>
      </div>
    `;
  }

  private startClock(): void {
    if (this.clockTimer !== null) clearInterval(this.clockTimer);
    this.clockTimer = window.setInterval(() => {
      const clockElem = this.container?.querySelector<HTMLDivElement>('#bedside-wall-clock');
      if (clockElem) {
        clockElem.textContent = this.getFormattedTime();
      }
    }, 1000);
  }

  private getFormattedTime(): string {
    const d = new Date();
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  private bindEvents(): void {
    if (!this.container) return;

    const screen = this.container.querySelector<HTMLDivElement>('#bedside-screen');

    screen?.addEventListener('click', (e) => {
      // Don't trigger toggle if clicking a button
      if ((e.target as HTMLElement).closest('button')) return;
      this.triggerControlsVisibility();
    });

    const toggleBtn = this.container.querySelector<HTMLButtonElement>('#btn-toggle-play');
    toggleBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const state = this.engine.getState();
      if (state.status === 'playing') {
        this.engine.pause();
        MediaSessionService.updatePlaybackState('paused');
      } else if (state.status === 'paused') {
        this.engine.resume();
        MediaSessionService.updatePlaybackState('playing');
      }
      this.resetControlsTimeout();
    });

    const exitBtn = this.container.querySelector<HTMLButtonElement>('#btn-stop-exit');
    exitBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.destroy();
      this.engine.stop();
      this.onExit();
    });
  }

  private triggerControlsVisibility(): void {
    if (!this.container) return;
    const overlay = this.container.querySelector<HTMLDivElement>('#bedside-controls-overlay');
    const hint = this.container.querySelector<HTMLDivElement>('#bedside-hint');
    if (!overlay) return;

    this.showControls = !this.showControls;
    if (this.showControls) {
      overlay.classList.remove('opacity-0', 'pointer-events-none');
      overlay.classList.add('opacity-100', 'pointer-events-auto');
      if (hint) hint.classList.add('opacity-0');
      this.resetControlsTimeout();
    } else {
      this.hideControls();
    }
  }

  private resetControlsTimeout(): void {
    if (this.controlsTimeout !== null) clearTimeout(this.controlsTimeout);
    this.controlsTimeout = window.setTimeout(() => {
      this.hideControls();
    }, 4000);
  }

  private hideControls(): void {
    if (!this.container) return;
    const overlay = this.container.querySelector<HTMLDivElement>('#bedside-controls-overlay');
    const hint = this.container.querySelector<HTMLDivElement>('#bedside-hint');
    if (overlay) {
      overlay.classList.add('opacity-0', 'pointer-events-none');
      overlay.classList.remove('opacity-100', 'pointer-events-auto');
    }
    if (hint) hint.classList.remove('opacity-0');
    this.showControls = false;
  }
}
