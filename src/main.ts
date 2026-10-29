import './style.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (app) {
  app.innerHTML = `
    <div class="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
      <div class="w-12 h-12 rounded-full border border-slate-800 flex items-center justify-center mb-4">
        <svg class="w-6 h-6 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v18" opacity="0.3" />
          <path d="M3 12h18" opacity="0.3" />
          <path d="M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5" />
        </svg>
      </div>
      <h1 class="text-xl font-medium tracking-wider text-slate-100">RENIGHT</h1>
      <p class="mt-2 text-xs text-dim tracking-widest uppercase">Monaural Brainwave Synchronization</p>
    </div>
  `;
}
