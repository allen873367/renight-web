import { SleepIssueType, SleepProfile, SoundscapeType } from '../types/sleep';
import { Icons } from './Icons';

export class OnboardingComponent {
  private currentStep = 1;
  private issueType: SleepIssueType = 'falling-asleep';
  private durationMinutes = 45;
  private soundscape: SoundscapeType = 'rain';
  private container: HTMLElement | null = null;
  private onComplete: ((profile: SleepProfile) => void) | null = null;

  public render(container: HTMLElement, onComplete: (profile: SleepProfile) => void): void {
    this.container = container;
    this.onComplete = onComplete;
    this.currentStep = 1;
    this.updateView();
  }

  private updateView(): void {
    if (!this.container) return;

    if (this.currentStep === 1) {
      this.renderStep1();
    } else if (this.currentStep === 2) {
      this.renderStep2();
    } else if (this.currentStep === 3) {
      this.renderStep3();
    }
  }

  private renderStep1(): void {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="max-w-md w-full mx-auto p-6 flex flex-col justify-between min-h-[90dvh]">
        <div class="space-y-6 pt-4">
          <!-- Step indicator -->
          <div class="flex items-center justify-between text-xs text-dim">
            <span class="tracking-widest uppercase">個人化好眠配置</span>
            <span>1 / 3</span>
          </div>

          <!-- Progress bar -->
          <div class="w-full h-1 bg-night rounded-full overflow-hidden">
            <div class="w-1/3 h-full bg-sky-500 rounded-full transition-all duration-300"></div>
          </div>

          <div>
            <h2 class="text-2xl font-light tracking-wide text-slate-100">您近期主要的睡眠困擾？</h2>
            <p class="text-sm text-dim mt-2">科學音波演算法將根據大腦狀態調整降頻曲線。</p>
          </div>

          <div class="space-y-3 pt-2">
            <button data-choice="falling-asleep" class="w-full p-4 rounded-xl border border-night hover:border-sky-500/50 bg-slate-900/40 text-left transition-all flex items-center justify-between active:scale-[0.98]">
              <div>
                <div class="font-medium text-slate-100 flex items-center gap-2">
                  <span>入睡困難</span>
                </div>
                <div class="text-xs text-dim mt-1">躺床 30 分鐘以上輾轉難眠、大腦思緒活躍</div>
              </div>
              <div class="text-sky-400 opacity-60">
                ${Icons.ChevronRight({ className: 'w-5 h-5' })}
              </div>
            </button>

            <button data-choice="shallow-sleep" class="w-full p-4 rounded-xl border border-night hover:border-sky-500/50 bg-slate-900/40 text-left transition-all flex items-center justify-between active:scale-[0.98]">
              <div>
                <div class="font-medium text-slate-100 flex items-center gap-2">
                  <span>半夜易醒／淺眠</span>
                </div>
                <div class="text-xs text-dim mt-1">睡眠極淺、稍有聲響即驚醒、難維持深睡</div>
              </div>
              <div class="text-sky-400 opacity-60">
                ${Icons.ChevronRight({ className: 'w-5 h-5' })}
              </div>
            </button>
          </div>
        </div>

        <div class="text-center text-xs text-slate-600 pb-4">
          外放單耳節拍物理調製 · 免戴耳機
        </div>
      </div>
    `;

    this.container.querySelectorAll<HTMLButtonElement>('[data-choice]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.issueType = btn.getAttribute('data-choice') as SleepIssueType;
        this.currentStep = 2;
        this.updateView();
      });
    });
  }

  private renderStep2(): void {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="max-w-md w-full mx-auto p-6 flex flex-col justify-between min-h-[90dvh]">
        <div class="space-y-6 pt-4">
          <div class="flex items-center justify-between text-xs text-dim">
            <span class="tracking-widest uppercase">個人化好眠配置</span>
            <span>2 / 3</span>
          </div>

          <div class="w-full h-1 bg-night rounded-full overflow-hidden">
            <div class="w-2/3 h-full bg-sky-500 rounded-full transition-all duration-300"></div>
          </div>

          <div>
            <h2 class="text-2xl font-light tracking-wide text-slate-100">預計播放時長？</h2>
            <p class="text-sm text-dim mt-2">播放結束前 10 分鐘將自動漸弱淡出，靜默入眠。</p>
          </div>

          <div class="grid grid-cols-2 gap-3 pt-2">
            <button data-choice="30" class="p-4 rounded-xl border border-night hover:border-sky-500/50 bg-slate-900/40 text-left transition-all active:scale-[0.98]">
              <div class="text-lg font-medium text-slate-100">30 分鐘</div>
              <div class="text-xs text-dim mt-1">短暫平復</div>
            </button>

            <button data-choice="45" class="p-4 rounded-xl border border-night hover:border-sky-500/50 bg-slate-900/40 text-left transition-all active:scale-[0.98]">
              <div class="text-lg font-medium text-slate-100">45 分鐘</div>
              <div class="text-xs text-dim mt-1">黃金入睡期（推薦）</div>
            </button>

            <button data-choice="60" class="p-4 rounded-xl border border-night hover:border-sky-500/50 bg-slate-900/40 text-left transition-all active:scale-[0.98]">
              <div class="text-lg font-medium text-slate-100">60 分鐘</div>
              <div class="text-xs text-dim mt-1">深層舒緩</div>
            </button>

            <button data-choice="90" class="p-4 rounded-xl border border-night hover:border-sky-500/50 bg-slate-900/40 text-left transition-all active:scale-[0.98]">
              <div class="text-lg font-medium text-slate-100">90 分鐘</div>
              <div class="text-xs text-dim mt-1">完整睡眠週期</div>
            </button>

            <button data-choice="480" class="col-span-2 p-4 rounded-xl border border-night hover:border-sky-500/50 bg-slate-900/40 text-left transition-all active:scale-[0.98]">
              <div class="text-lg font-medium text-slate-100">全夜維持 (8 小時)</div>
              <div class="text-xs text-dim mt-1">整夜連續慢波守護，遮蔽突發環境雜音</div>
            </button>
          </div>
        </div>

        <div class="text-center text-xs text-slate-600 pb-4">
          支援 Screen WakeLock 微光防休眠
        </div>
      </div>
    `;

    this.container.querySelectorAll<HTMLButtonElement>('[data-choice]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.durationMinutes = parseInt(btn.getAttribute('data-choice') || '45', 10);
        this.currentStep = 3;
        this.updateView();
      });
    });
  }

  private renderStep3(): void {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="max-w-md w-full mx-auto p-6 flex flex-col justify-between min-h-[90dvh]">
        <div class="space-y-6 pt-4">
          <div class="flex items-center justify-between text-xs text-dim">
            <span class="tracking-widest uppercase">個人化好眠配置</span>
            <span>3 / 3</span>
          </div>

          <div class="w-full h-1 bg-night rounded-full overflow-hidden">
            <div class="w-full h-full bg-sky-500 rounded-full transition-all duration-300"></div>
          </div>

          <div>
            <h2 class="text-2xl font-light tracking-wide text-slate-100">伴隨環境聲景</h2>
            <p class="text-sm text-dim mt-2">可與單耳節拍雙軌疊加，隨時自由調整音量。</p>
          </div>

          <div class="space-y-2.5 pt-1">
            <button data-choice="rain" class="w-full p-3.5 rounded-xl border border-night hover:border-sky-500/50 bg-slate-900/40 flex items-center justify-between text-left transition-all active:scale-[0.98]">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-slate-800/60 text-sky-400">
                  ${Icons.Rain({ className: 'w-5 h-5' })}
                </div>
                <div>
                  <div class="font-medium text-slate-100">窗邊細雨</div>
                  <div class="text-xs text-dim">均勻水滴包絡，天然隔音</div>
                </div>
              </div>
              <div class="text-dim">${Icons.ChevronRight({ className: 'w-4 h-4' })}</div>
            </button>

            <button data-choice="fireplace" class="w-full p-3.5 rounded-xl border border-night hover:border-sky-500/50 bg-slate-900/40 flex items-center justify-between text-left transition-all active:scale-[0.98]">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-slate-800/60 text-amber-400">
                  ${Icons.Fire({ className: 'w-5 h-5' })}
                </div>
                <div>
                  <div class="font-medium text-slate-100">溫暖柴火</div>
                  <div class="text-xs text-dim">低頻木質微脆音，安撫神經</div>
                </div>
              </div>
              <div class="text-dim">${Icons.ChevronRight({ className: 'w-4 h-4' })}</div>
            </button>

            <button data-choice="pink-noise" class="w-full p-3.5 rounded-xl border border-night hover:border-sky-500/50 bg-slate-900/40 flex items-center justify-between text-left transition-all active:scale-[0.98]">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-slate-800/60 text-purple-400">
                  ${Icons.Sparkles({ className: 'w-5 h-5' })}
                </div>
                <div>
                  <div class="font-medium text-slate-100">深層粉紅噪音</div>
                  <div class="text-xs text-dim">1/f 自然頻率，加深慢波睡眠</div>
                </div>
              </div>
              <div class="text-dim">${Icons.ChevronRight({ className: 'w-4 h-4' })}</div>
            </button>

            <button data-choice="brown-noise" class="w-full p-3.5 rounded-xl border border-night hover:border-sky-500/50 bg-slate-900/40 flex items-center justify-between text-left transition-all active:scale-[0.98]">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-slate-800/60 text-emerald-400">
                  ${Icons.SoundWave({ className: 'w-5 h-5' })}
                </div>
                <div>
                  <div class="font-medium text-slate-100">低頻棕色噪音</div>
                  <div class="text-xs text-dim">低沉重力感，遮蔽外界突然聲響</div>
                </div>
              </div>
              <div class="text-dim">${Icons.ChevronRight({ className: 'w-4 h-4' })}</div>
            </button>

            <button data-choice="silent" class="w-full p-3.5 rounded-xl border border-night hover:border-sky-500/50 bg-slate-900/40 flex items-center justify-between text-left transition-all active:scale-[0.98]">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-slate-800/60 text-slate-400">
                  ${Icons.Moon({ className: 'w-5 h-5' })}
                </div>
                <div>
                  <div class="font-medium text-slate-100">純淨節拍</div>
                  <div class="text-xs text-dim">僅播放單耳節拍，無背景聲景</div>
                </div>
              </div>
              <div class="text-dim">${Icons.ChevronRight({ className: 'w-4 h-4' })}</div>
            </button>
          </div>
        </div>

        <div class="text-center text-xs text-slate-600 pb-4">
          設定將自動記憶在您的手機瀏覽器
        </div>
      </div>
    `;

    this.container.querySelectorAll<HTMLButtonElement>('[data-choice]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.soundscape = btn.getAttribute('data-choice') as SoundscapeType;
        this.finish();
      });
    });
  }

  private finish(): void {
    const profile: SleepProfile = {
      issueType: this.issueType,
      durationMinutes: this.durationMinutes,
      soundscape: this.soundscape,
      beatVolume: 0.7,
      soundscapeVolume: 0.5,
      lastUpdated: Date.now()
    };

    if (this.onComplete) {
      this.onComplete(profile);
    }
  }
}
