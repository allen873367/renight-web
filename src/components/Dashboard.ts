import { EngineState, SoundEngine } from '../audio/engine';
import { SleepProfile } from '../types/sleep';
import { Icons } from './Icons';
import { MixerSliders } from './MixerSliders';

export class DashboardComponent {
  private engine: SoundEngine;
  private profile: SleepProfile;
  private container: HTMLElement | null = null;
  private mixer: MixerSliders;
  private onStart: () => void = () => {};
  private onEditProfile: () => void = () => {};

  constructor(engine: SoundEngine, profile: SleepProfile) {
    this.engine = engine;
    this.profile = profile;
    this.mixer = new MixerSliders(this.engine, (track) => {
      this.profile.soundscape = track;
    });
  }

  public render(
    container: HTMLElement,
    handlers: { onStart: () => void; onEditProfile: () => void }
  ): void {
    this.container = container;
    this.onStart = handlers.onStart;
    this.onEditProfile = handlers.onEditProfile;

    const issueLabel = this.profile.issueType === 'falling-asleep' ? '入睡困難引導' : '深睡慢波維持';
    const issueDesc = this.profile.issueType === 'falling-asleep'
      ? 'Alpha (10Hz) → Theta (5Hz) → Delta (2Hz) 漸進降頻'
      : 'Delta (1.8Hz) 低頻慢波守護 · 阻絕夜間雜音';

    const durationDisplay = this.profile.durationMinutes >= 480
      ? '全夜守護 (8h)'
      : `${this.profile.durationMinutes} 分鐘`;

    this.container.innerHTML = `
      <div class="max-w-md w-full mx-auto p-5 flex flex-col justify-between min-h-[100dvh]">
        <!-- Top App Bar -->
        <header class="flex items-center justify-between pt-2">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center text-sky-400">
              ${Icons.Moon({ className: 'w-4 h-4' })}
            </div>
            <div>
              <h1 class="text-sm font-semibold tracking-wider text-slate-100">RENIGHT</h1>
              <p class="text-[10px] text-dim tracking-widest uppercase">Monaural Sleep Lab</p>
            </div>
          </div>

          <button id="btn-edit-profile" class="p-2 rounded-xl text-dim hover:text-slate-200 border border-night bg-slate-900/60 transition-all flex items-center gap-1.5 text-xs active:scale-95">
            ${Icons.Settings({ className: 'w-4 h-4' })}
            <span>調整計畫</span>
          </button>
        </header>

        <!-- Center Card: Plan Details -->
        <div class="space-y-4 my-auto py-4">
          <!-- Science Plan Card -->
          <div class="p-5 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-slate-800/80 space-y-3">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                ${issueLabel}
              </span>
              <span class="text-xs text-dim flex items-center gap-1">
                ${Icons.Clock({ className: 'w-3.5 h-3.5' })}
                ${durationDisplay}
              </span>
            </div>

            <div>
              <h2 class="text-lg font-light text-slate-100 tracking-wide">今日個人化助眠計畫</h2>
              <p class="text-xs text-dim mt-1">${issueDesc}</p>
            </div>

            <!-- Frequency curve schematic -->
            <div class="pt-2">
              <div class="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1.5">
                <span>放鬆 (10 Hz)</span>
                <span>過渡 (6 Hz)</span>
                <span>深睡 (2 Hz)</span>
              </div>
              <div class="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden flex">
                <div class="w-1/4 h-full bg-sky-500/80"></div>
                <div class="w-1/3 h-full bg-indigo-500/80"></div>
                <div class="flex-1 h-full bg-purple-500/80"></div>
              </div>
            </div>
          </div>

          <!-- Dual-Track Sound Mixer Container -->
          <div id="mixer-container"></div>
        </div>

        <!-- Bottom Action: Start Sleep Button -->
        <div class="pb-6 pt-2">
          <button id="btn-start-sleep" class="w-full py-4 rounded-2xl bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-slate-950 font-medium text-base tracking-wide flex items-center justify-center gap-2.5 shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98]">
            ${Icons.Play({ className: 'w-5 h-5 fill-current' })}
            <span>開始好眠</span>
          </button>
          <div class="text-center text-[11px] text-slate-500 mt-3">
            外放置於床頭 1–2 公尺 · 定時前 10 分鐘淡出
          </div>
        </div>
      </div>
    `;

    const mixerElem = this.container.querySelector<HTMLElement>('#mixer-container');
    if (mixerElem) {
      this.mixer.render(mixerElem);
    }

    this.container.querySelector<HTMLButtonElement>('#btn-start-sleep')?.addEventListener('click', () => {
      this.onStart();
    });

    this.container.querySelector<HTMLButtonElement>('#btn-edit-profile')?.addEventListener('click', () => {
      this.onEditProfile();
    });
  }

  public updateState(_state: EngineState): void {
    // Used when dashboard is active (or returning from bedside)
  }
}
