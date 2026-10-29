import { SoundEngine } from '../audio/engine';
import { SoundscapeType } from '../types/sleep';
import { Icons } from './Icons';

export class MixerSliders {
  private engine: SoundEngine;
  private container: HTMLElement | null = null;
  private onTrackChange?: (track: SoundscapeType) => void;

  constructor(engine: SoundEngine, onTrackChange?: (track: SoundscapeType) => void) {
    this.engine = engine;
    this.onTrackChange = onTrackChange;
  }

  public render(container: HTMLElement): void {
    this.container = container;
    const state = this.engine.getState();

    this.container.innerHTML = `
      <div class="space-y-4 rounded-2xl bg-slate-900/50 border border-night p-4 select-none">
        <!-- Track 1: Monaural Beats -->
        <div class="space-y-2">
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-2 text-slate-200 font-medium">
              <span class="text-sky-400">${Icons.SoundWave({ className: 'w-4 h-4' })}</span>
              <span>單耳節拍 (腦波引導)</span>
            </div>
            <span id="beat-volume-label" class="font-mono text-dim">${Math.round(state.beatVolume * 100)}%</span>
          </div>
          <input
            id="beat-volume-slider"
            type="range"
            min="0"
            max="100"
            value="${Math.round(state.beatVolume * 100)}"
            class="w-full cursor-pointer accent-sky-400"
          />
        </div>

        <!-- Track 2: Soundscape -->
        <div class="space-y-2 pt-2 border-t border-slate-800/60">
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-2 text-slate-200 font-medium">
              <span class="text-amber-400">${Icons.Volume({ className: 'w-4 h-4' })}</span>
              <span>環境聲景</span>
            </div>
            <span id="soundscape-volume-label" class="font-mono text-dim">${Math.round(state.soundscapeVolume * 100)}%</span>
          </div>
          <input
            id="soundscape-volume-slider"
            type="range"
            min="0"
            max="100"
            value="${Math.round(state.soundscapeVolume * 100)}"
            class="w-full cursor-pointer accent-sky-400"
          />

          <!-- Soundscape selector pills -->
          <div class="flex items-center gap-1.5 pt-2 overflow-x-auto no-scrollbar py-1">
            <button data-track="rain" class="track-pill px-3 py-1.5 rounded-lg text-xs border border-night whitespace-nowrap transition-all ${state.soundscapeTrack === 'rain' ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-medium' : 'bg-slate-800/40 text-dim hover:text-slate-300'}">
              細雨
            </button>
            <button data-track="fireplace" class="track-pill px-3 py-1.5 rounded-lg text-xs border border-night whitespace-nowrap transition-all ${state.soundscapeTrack === 'fireplace' ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-medium' : 'bg-slate-800/40 text-dim hover:text-slate-300'}">
              柴火
            </button>
            <button data-track="pink-noise" class="track-pill px-3 py-1.5 rounded-lg text-xs border border-night whitespace-nowrap transition-all ${state.soundscapeTrack === 'pink-noise' ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-medium' : 'bg-slate-800/40 text-dim hover:text-slate-300'}">
              粉噪
            </button>
            <button data-track="brown-noise" class="track-pill px-3 py-1.5 rounded-lg text-xs border border-night whitespace-nowrap transition-all ${state.soundscapeTrack === 'brown-noise' ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-medium' : 'bg-slate-800/40 text-dim hover:text-slate-300'}">
              棕噪
            </button>
            <button data-track="silent" class="track-pill px-3 py-1.5 rounded-lg text-xs border border-night whitespace-nowrap transition-all ${state.soundscapeTrack === 'silent' ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-medium' : 'bg-slate-800/40 text-dim hover:text-slate-300'}">
              靜音
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    if (!this.container) return;

    const beatSlider = this.container.querySelector<HTMLInputElement>('#beat-volume-slider');
    const beatLabel = this.container.querySelector<HTMLSpanElement>('#beat-volume-label');
    beatSlider?.addEventListener('input', () => {
      const val = parseInt(beatSlider.value, 10);
      if (beatLabel) beatLabel.textContent = `${val}%`;
      this.engine.setBeatVolume(val / 100);
    });

    const soundscapeSlider = this.container.querySelector<HTMLInputElement>('#soundscape-volume-slider');
    const soundscapeLabel = this.container.querySelector<HTMLSpanElement>('#soundscape-volume-label');
    soundscapeSlider?.addEventListener('input', () => {
      const val = parseInt(soundscapeSlider.value, 10);
      if (soundscapeLabel) soundscapeLabel.textContent = `${val}%`;
      this.engine.setSoundscapeVolume(val / 100);
    });

    this.container.querySelectorAll<HTMLButtonElement>('.track-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        const track = btn.getAttribute('data-track') as SoundscapeType;
        this.engine.setSoundscapeTrack(track);

        // Update active class
        this.container?.querySelectorAll('.track-pill').forEach((p) => {
          p.className = 'track-pill px-3 py-1.5 rounded-lg text-xs border border-night whitespace-nowrap transition-all bg-slate-800/40 text-dim hover:text-slate-300';
        });
        btn.className = 'track-pill px-3 py-1.5 rounded-lg text-xs border border-night whitespace-nowrap transition-all bg-sky-500/20 border-sky-500 text-sky-300 font-medium';

        if (this.onTrackChange) this.onTrackChange(track);
      });
    });
  }
}
