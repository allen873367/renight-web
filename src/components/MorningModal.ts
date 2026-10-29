import { StorageService } from '../utils/storage';
import { Icons } from './Icons';

export class MorningModal {
  private container: HTMLElement | null = null;
  private selectedStars = 5;
  private selectedTag = '深睡充足';

  public static shouldShow(): boolean {
    return !StorageService.hasCheckedInToday();
  }

  public render(container: HTMLElement, onDone: () => void): void {
    this.container = container;
    const modalWrapper = document.createElement('div');
    modalWrapper.id = 'morning-modal-overlay';
    modalWrapper.className = 'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none';

    modalWrapper.innerHTML = `
      <div class="w-full max-w-sm rounded-3xl bg-slate-950 border border-slate-800 p-6 space-y-5 shadow-2xl">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sky-400">${Icons.Sparkles({ className: 'w-5 h-5' })}</span>
            <span class="text-xs text-dim tracking-wider uppercase font-medium">晨間好眠感受</span>
          </div>
          <button id="btn-close-modal" class="text-slate-600 hover:text-slate-400 p-1">
            ${Icons.Close({ className: 'w-4 h-4' })}
          </button>
        </div>

        <div>
          <h3 class="text-xl font-light text-slate-100">昨夜睡得還好嗎？</h3>
          <p class="text-xs text-dim mt-1">簡短記錄有助於了解腦波聲學調製對您的持續改善效果。</p>
        </div>

        <!-- Star rating row -->
        <div class="flex items-center justify-center gap-3 py-2">
          ${[1, 2, 3, 4, 5].map((star) => `
            <button data-star="${star}" class="star-btn p-1.5 text-amber-400/30 hover:text-amber-400 transition-colors">
              ${Icons.Star({ className: 'w-7 h-7' })}
            </button>
          `).join('')}
        </div>

        <!-- Quick tag choices -->
        <div class="flex flex-wrap gap-2 justify-center">
          ${['深睡充足', '更快入眠', '半夜易醒', '頭腦清爽'].map((tag) => `
            <button data-tag="${tag}" class="tag-btn px-3 py-1.5 rounded-full text-xs border border-night bg-slate-900/60 text-dim hover:text-slate-200 transition-all">
              ${tag}
            </button>
          `).join('')}
        </div>

        <button id="btn-save-checkin" class="w-full py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-slate-950 font-medium text-sm tracking-wide transition-all shadow-lg shadow-sky-500/20 active:scale-[0.98]">
          記錄並開始今日
        </button>
      </div>
    `;

    this.container.appendChild(modalWrapper);
    this.updateStarsUI(modalWrapper);
    this.updateTagsUI(modalWrapper);

    // Event listeners
    modalWrapper.querySelectorAll<HTMLButtonElement>('.star-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.selectedStars = parseInt(btn.getAttribute('data-star') || '5', 10);
        this.updateStarsUI(modalWrapper);
      });
    });

    modalWrapper.querySelectorAll<HTMLButtonElement>('.tag-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.selectedTag = btn.getAttribute('data-tag') || '';
        this.updateTagsUI(modalWrapper);
      });
    });

    const close = () => {
      modalWrapper.remove();
      onDone();
    };

    modalWrapper.querySelector<HTMLButtonElement>('#btn-close-modal')?.addEventListener('click', close);
    modalWrapper.querySelector<HTMLButtonElement>('#btn-save-checkin')?.addEventListener('click', () => {
      StorageService.saveCheckin(this.selectedStars, this.selectedTag);
      close();
    });
  }

  private updateStarsUI(wrapper: HTMLElement): void {
    wrapper.querySelectorAll<HTMLButtonElement>('.star-btn').forEach((btn) => {
      const star = parseInt(btn.getAttribute('data-star') || '0', 10);
      const isFilled = star <= this.selectedStars;
      btn.className = `star-btn p-1.5 transition-colors ${isFilled ? 'text-amber-400' : 'text-slate-800 hover:text-amber-400/40'}`;
      btn.innerHTML = Icons.Star({ className: 'w-7 h-7', filled: isFilled });
    });
  }

  private updateTagsUI(wrapper: HTMLElement): void {
    wrapper.querySelectorAll<HTMLButtonElement>('.tag-btn').forEach((btn) => {
      const tag = btn.getAttribute('data-tag');
      if (tag === this.selectedTag) {
        btn.className = 'tag-btn px-3 py-1.5 rounded-full text-xs border border-sky-500/60 bg-sky-500/20 text-sky-300 font-medium transition-all';
      } else {
        btn.className = 'tag-btn px-3 py-1.5 rounded-full text-xs border border-night bg-slate-900/60 text-dim hover:text-slate-200 transition-all';
      }
    });
  }
}
