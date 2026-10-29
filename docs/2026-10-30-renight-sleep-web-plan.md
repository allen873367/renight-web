# Renight-Web 腦波同步助眠 PWA 實作計畫 (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建置一個類似 Renight (Nightly) 的純前端零成本助眠 PWA，以單耳節拍 (Monaural Beats) 物理聲波調製結合環境聲景，提供個人化問卷評估、雙軌混音、床頭微光暗屏與本地狀態記憶。

**Architecture:** 前端採用 Vite + TypeScript + Tailwind CSS 建置輕量單頁 PWA。音訊層利用 Web Audio API 於客戶端實時進行單耳振幅調製（AM）與噪聲濾波合成，無需伺服器。持久化採用 `localStorage` 達成免重複填表的終身記憶，介面嚴格遵循極致 Mobile-First RWD 與零 Emoji 的專業醫療聲學幾何設計。

**Tech Stack:** TypeScript, Vite, Tailwind CSS, Web Audio API, Vitest, Happy-DOM, Service Worker (PWA).

**Spec:** `C:\Users\mike9\OneDrive - National Pingtung University\桌面\PROJECT\renight-web\docs\2026-10-30-renight-sleep-web-design.md`

## Global Constraints
- **零伺服器依賴**：完全為靜態前端資源，可於本地或 GitHub Pages 免費託管。
- **純外放單耳節拍**：嚴禁強制要求配戴耳機，聲波必須在揚聲器實體空間中完成包絡振幅調製。
- **純助眠非鬧鐘**：定時結束前 10 分鐘自動進行指數型淡出靜音並釋放 AudioContext，不承擔強制鬧鐘責任。
- **嚴禁 Emoji**：全站 UI 嚴格禁止使用任何 Emoji，一律使用極簡線性 SVG 幾何圖標。
- **極致 Mobile-First RWD**：全站以手機床頭夜間操作為基準，使用 `100dvh` 與 `env(safe-area-inset-*)`，支援螢幕暗屏防藍光。

## Review Focus
1. **iOS Safari 音訊手勢解鎖**：若使用者未主動點擊直接觸發 AudioContext，Safari 會掛起音訊；預期行為為必須經由明確按鈕解鎖 AudioContext。
2. **手機螢幕休眠鎖定中斷**：若未妥善處理，手機鎖屏後 Web Audio 可能在數十秒內被系統凍結；預期行為為透過 `MediaSession` 與連續音訊保持播放。
3. **localStorage 首次與再次造訪狀態判斷**：若已填寫過問卷，重啟網址應直接進入主控儀表板，不得重新彈出問卷。
4. **定時器淡出邊界計算**：若設定時長為 30 分鐘，在 20 分鐘時必須平滑啟動 10 分鐘 Linear/Exponential Ramp 淡出，音量平順降至 0。
5. **雙軌獨立增益平衡**：單耳節拍與環境聲景軌道音量滑桿互不干擾，且經過 Master Gain 限幅避免破音 (Clipping)。

---

## Task Structure

### Task 1: 專案基底搭建與開發環境配置 (Project Scaffolding)

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.ts`
- Create: `src/style.css`

**Interfaces:**
- Consumes: None
- Produces: 具備 TypeScript, Tailwind CSS, Vitest 測試環境的現代化開發骨架。

- [ ] **Step 1: 撰寫 package.json 配置**
  設定 `name: "renight-web"`, `type: "module"`, 依賴包含 `vite`, `typescript`, `tailwindcss`, `postcss`, `autoprefixer`, `vitest`, `happy-dom`。
- [ ] **Step 2: 建立 tsconfig.json 與 vite.config.ts**
  配置 DOM 與 ESNext target，支援路徑別名與測試環境 `environment: 'happy-dom'`。
- [ ] **Step 3: 建立 index.html 與 style.css**
  配置 Mobile Viewport (`width=device-width, initial-scale=1.0, viewport-fit=cover`)，背景純黑 `#000000`，字型採用現代無襯線體。
- [ ] **Step 4: 安裝依賴並驗證測試腳本**
  執行：`npm install && npm test -- --run`
  預期：無報錯完成安裝，測試指令可正常啟動。
- [ ] **Step 5: 提交基底代碼**
  ```bash
  git init
  git add .
  git commit -m "chore: scaffold project with vite typescript and tailwind"
  ```

---

### Task 2: 核心型別、本地存儲服務與聲波數學計算 (Core Types, Storage & Audio Math)

**Files:**
- Create: `src/types/sleep.ts`
- Create: `src/utils/storage.ts`
- Create: `src/audio/math.ts`
- Create: `tests/audio-math.test.ts`
- Create: `tests/storage.test.ts`

**Interfaces:**
- Consumes: None
- Produces:
  - `SleepProfile`: 包含困擾類型 (`'falling-asleep' | 'shallow-sleep'`)、時長、聲景偏好。
  - `StorageService`: `saveProfile(p: SleepProfile): void`, `getProfile(): SleepProfile | null`, `saveCheckin(stars: number): void`。
  - `AudioMath`: `calculateFrequencies(stage: string, elapsed: number, total: number): { carrier: number, beat: number }`, `getFadeGain(remainingSeconds: number, fadeDuration: number): number`。

- [ ] **Step 1: 撰寫 audio-math 與 storage 單元測試**
  驗證：
  1. `calculateFrequencies` 在「入睡困難」初期產出 10 Hz Alpha，後期平滑降至 2 Hz Delta。
  2. `getFadeGain` 在最後 10 分鐘（600 秒）由 1.0 線性/指數降至 0.0。
  3. `StorageService` 可正確保存與讀取 Profile，未設定時回傳 `null`。
- [ ] **Step 2: 執行測試確認失敗**
  執行：`npm test -- tests/audio-math.test.ts tests/storage.test.ts --run`
  預期：FAIL（模組尚未實作）。
- [ ] **Step 3: 實作型別定義、儲存服務與聲波數學**
  - 在 `src/types/sleep.ts` 定義資料結構。
  - 在 `src/utils/storage.ts` 實作安全讀寫 localStorage（具備 try/catch 防隱私模式例外）。
  - 在 `src/audio/math.ts` 實作科學腦波頻率計算與淡出公式。
- [ ] **Step 4: 執行測試確認通過**
  執行：`npm test -- tests/audio-math.test.ts tests/storage.test.ts --run`
  預期：PASS。
- [ ] **Step 5: 提交代碼**
  ```bash
  git add src/ tests/
  git commit -m "feat: add sleep types, storage service and audio math engine"
  ```

---

### Task 3: Web Audio 單耳節拍與雙軌聲景音訊引擎 (Web Audio Engine)

**Files:**
- Create: `src/audio/noise.ts`
- Create: `src/audio/engine.ts`
- Create: `tests/audio-engine.test.ts`

**Interfaces:**
- Consumes: `AudioMath` from Task 2.
- Produces:
  - `SoundEngine`:
    - `init(): Promise<void>`
    - `start(profile: SleepProfile): void`
    - `stop(): void`
    - `setBeatVolume(val: number): void`
    - `setSoundscapeVolume(val: number): void`
    - `setSoundscapeTrack(trackId: string): void`
    - `onTick(callback: (state: EngineState) => void): void`

- [ ] **Step 1: 撰寫音訊引擎狀態測試**
  驗證：`SoundEngine` 初始化狀態為 `idle`，呼叫 `start` 轉換為 `playing`，`stop` 呼叫後重置定時器。
- [ ] **Step 2: 執行測試確認失敗**
  執行：`npm test -- tests/audio-engine.test.ts --run`
  預期：FAIL。
- [ ] **Step 3: 實作單耳節拍合成與雙軌混音核心**
  - 在 `src/audio/noise.ts` 實作粉紅噪音 (Pink Noise) 與棕色噪音 (Brown Noise) 之 Web Audio AudioBuffer 演算法生成器（低通 -12dB 濾波）。
  - 在 `src/audio/engine.ts` 建立 Web Audio Context 節點圖：
    1. **Track 1**: `OscillatorNode` (Carrier 120Hz) -> `GainNode` (AM 調製由第二個 LFO Oscillator 調控) -> `GainNode` (Track 1 Volume) -> Master Gain。
    2. **Track 2**: `AudioBufferSourceNode` (自然音/噪聲循環) -> `GainNode` (Track 2 Volume) -> Master Gain。
    3. `MasterGainNode` -> `AudioContext.destination`。
    4. 註冊定時檢查器與 10 分鐘漸弱排程。
- [ ] **Step 4: 執行測試確認通過**
  執行：`npm test -- tests/audio-engine.test.ts --run`
  預期：PASS。
- [ ] **Step 5: 提交代碼**
  ```bash
  git add src/audio/ tests/
  git commit -m "feat: implement web audio monaural beats and dual-track sound engine"
  ```

---

### Task 4: 零 Emoji 精緻線性 SVG 圖標庫與夜間設計規範 (Icon Library & Theme)

**Files:**
- Create: `src/components/Icons.ts`
- Modify: `src/style.css`

**Interfaces:**
- Consumes: None
- Produces:
  - `Icons`: `Play()`, `Pause()`, `Moon()`, `SoundWave()`, `Volume()`, `Rain()`, `Fire()`, `Sparkles()`, `Settings()`, `Check()`, `Star()`, `Clock()`。全部為優雅的 24x24 線性 SVG 字串，嚴格禁止 Emoji。

- [ ] **Step 1: 實作 Icons.ts 向量圖標集合**
  使用標準 SVG stroke 語法，線寬 1.5/2，統一支援 `class` 參數傳遞顏色與大小。
- [ ] **Step 2: 配置 Tailwind 夜間與 OLED 專屬樣式**
  擴展深色色階：`bg-void: #000000`, `text-dim: #8A99A8`, `border-night: #1E293B`, `accent-calm: #38BDF8`。
- [ ] **Step 3: 驗證圖標渲染不含任何 Unicode Emoji 碼**
  執行簡單語法檢查與視覺確認，確保每個圖標皆為合法 SVG。
- [ ] **Step 4: 提交代碼**
  ```bash
  git add src/components/Icons.ts src/style.css
  git commit -m "style: add pure svg icons and oled night theme tokens"
  ```

---

### Task 5: Mobile-First 入站睡眠問卷引導模組 (Onboarding Flow)

**Files:**
- Create: `src/components/Onboarding.ts`
- Create: `tests/onboarding.test.ts`

**Interfaces:**
- Consumes: `SleepProfile` from Task 2, `Icons` from Task 4.
- Produces:
  - `OnboardingComponent`:
    - `render(container: HTMLElement, onComplete: (profile: SleepProfile) => void): void`

- [ ] **Step 1: 撰寫問卷互動測試**
  驗證：
  1. 依序回答 Q1（困擾）、Q2（時長）、Q3（聲景）後，觸發 `onComplete` 回調。
  2. 回調之 `SleepProfile` 包含完整設定。
- [ ] **Step 2: 執行測試確認失敗**
  執行：`npm test -- tests/onboarding.test.ts --run`
  預期：FAIL。
- [ ] **Step 3: 實作 Onboarding 互動卡片**
  - 卡片 1：主要睡眠困擾（入睡困難輾轉難眠 vs 半夜容易驚醒淺眠）。
  - 卡片 2：目標睡眠時長（30 分鐘、45 分鐘、60 分鐘、全夜循環）。
  - 卡片 3：偏好環境聲景（窗邊細雨、溫暖柴火、低頻棕噪、深空粉噪、純淨波）。
  - 卡片滑動轉場動畫、大尺寸觸控區塊、手機端優化。
- [ ] **Step 4: 執行測試確認通過**
  執行：`npm test -- tests/onboarding.test.ts --run`
  預期：PASS。
- [ ] **Step 5: 提交代碼**
  ```bash
  git add src/components/ tests/
  git commit -m "feat: implement mobile-first sleep onboarding questionnaire"
  ```

---

### Task 6: 今日助眠儀表板與雙軌混音器介面 (Dashboard & Dual-Track Mixer)

**Files:**
- Create: `src/components/Dashboard.ts`
- Create: `src/components/MixerSliders.ts`

**Interfaces:**
- Consumes: `SoundEngine` from Task 3, `SleepProfile` from Task 2, `Icons` from Task 4.
- Produces:
  - `DashboardComponent`:
    - `render(container: HTMLElement, handlers: { onStart: () => void, onEditProfile: () => void }): void`
    - `updateState(state: EngineState): void`

- [ ] **Step 1: 實作雙軌獨立滑桿元件 (MixerSliders)**
  - 軌道 1（腦波強度）：0% - 100% 觸控滑桿。
  - 軌道 2（環境聲景）：0% - 100% 觸控滑桿，並可快速切換聲景（細雨/柴火/粉噪/棕噪/靜音）。
- [ ] **Step 2: 實作主儀表板 (Dashboard)**
  - 頂部：個人化問卷摘要與「重新設定」按鈕。
  - 中部：今日助眠推薦卡（目標波段 Theta/Delta、總倒數時間、雙軌混音控制器）。
  - 底部：醒目的「開始好眠 (Start Sleep)」大按鈕，單手可觸及。
- [ ] **Step 3: 手機端 RWD 測試驗證**
  確保所有控制元素在 320px - 430px 手機寬度與電腦寬度下無擠壓、無溢出滾動條。
- [ ] **Step 4: 提交代碼**
  ```bash
  git add src/components/
  git commit -m "feat: implement dashboard and dual-track mixer interface"
  ```

---

### Task 7: 床頭沉浸暗屏模式、Screen WakeLock 與鎖定畫面控制 (Bedside Immersion)

**Files:**
- Create: `src/components/BedsideClock.ts`
- Create: `src/services/wakeLock.ts`
- Create: `src/services/mediaSession.ts`

**Interfaces:**
- Consumes: `SoundEngine` from Task 3, `Icons` from Task 4.
- Produces:
  - `BedsideClockComponent`: 極簡微光時鐘、剩餘時間、平滑波浪微光動態、退出/暫停手勢。
  - `WakeLockService`: `requestLock()`, `releaseLock()`。
  - `MediaSessionService`: 設定手機鎖定畫面之播放/暫停控制器與音訊標題。

- [ ] **Step 1: 實作 Screen WakeLock 與 MediaSession 服務**
  在手機瀏覽器支援情況下調用 `navigator.wakeLock.request('screen')`，支援休眠中自動重新請求；配置 `navigator.mediaSession.metadata` 讓使用者可以在手機下拉控制列控制暫停與恢復。
- [ ] **Step 2: 實作 BedsideClock 沉浸式暗屏元件**
  - 純黑背景 `#000000`，字型採用超暗冷灰低刺激色。
  - 顯示即時數位時鐘（例如 `02:45`）與剩餘定時器倒數（例如 `24:12`）。
  - 點擊螢幕任何區域喚醒操作浮動控制（微調音量或暫停），3 秒無操作自動隱藏回歸微光。
- [ ] **Step 3: 驗證 10 分鐘平滑淡出與結束狀態**
  定時器倒數至 0 時，呼叫音訊淡出，介面回歸沉靜待機，不發出任何尖銳提示。
- [ ] **Step 4: 提交代碼**
  ```bash
  git add src/components/ src/services/
  git commit -m "feat: implement bedside clock, screen wakelock and media session"
  ```

---

### Task 8: 晨間睡眠打卡、PWA Manifest 與離線快取配置 (Morning Checkin & PWA)

**Files:**
- Create: `src/components/MorningModal.ts`
- Create: `public/manifest.json`
- Create: `public/sw.js`
- Create: `public/icons/icon-192.svg`
- Create: `public/icons/icon-512.svg`

**Interfaces:**
- Consumes: `StorageService` from Task 2, `Icons` from Task 4.
- Produces:
  - 晨間打卡視窗（1–5 星評分與清爽記錄）。
  - PWA Web App Manifest（支援手機「加入主畫面」像原生 App 一般運行）。
  - Service Worker 離線快取核心資源。

- [ ] **Step 1: 實作 MorningModal 晨間打卡元件**
  若上次播放時間大於 4 小時且今日尚未打卡，開啟網頁時彈出溫柔的「昨夜睡眠感受」5 顆星選擇，評分後自動隱藏並存入歷史紀錄。
- [ ] **Step 2: 建立 PWA Manifest 與向量 App Icon**
  配置 `display: "standalone"`, `background_color: "#000000"`, `theme_color: "#000000"`，提供專業線性幾何 SVG App 圖標。
- [ ] **Step 3: 建立 Service Worker 快取腳本**
  快取 HTML、CSS、JS 與音訊資源，支援在無網路（飛航模式）下離線啟動助眠。
- [ ] **Step 4: 提交代碼**
  ```bash
  git add src/components/ public/
  git commit -m "feat: add morning check-in modal and pwa offline capabilities"
  ```

---

### Task 9: 整合組裝、跨端驗證與 GitHub Pages 發布準備 (Assembly & Verification)

**Files:**
- Modify: `src/main.ts`
- Create: `README.md`
- Test: 全端所有單元與整合測試

**Interfaces:**
- 完整應用生命週期整合：
  `Storage.getProfile()` -> 若無則顯示 `Onboarding` -> 填畢儲存並顯示 `Dashboard` -> 點擊播放進入 `BedsideClock` -> 定時結束淡出。

- [ ] **Step 1: 在 main.ts 串接完整狀態機流程**
  組裝 Onboarding、Dashboard、BedsideClock、MorningModal，並連接 SoundEngine。
- [ ] **Step 2: 執行完整測試套件**
  執行：`npm test -- --run`
  預期：全部單元測試 PASS。
- [ ] **Step 3: 執行生產環境編譯打包**
  執行：`npm run build`
  預期：成功輸出 `dist/` 靜態檔案，無 TypeScript 錯誤，無資源路徑錯誤。
- [ ] **Step 4: 撰寫 README.md 與 GitHub Pages 一鍵部署指南**
  包含本機開啟方式、GitHub Pages 免費託管說明、iOS Safari / Android 手機「加入主畫面」指引。
- [ ] **Step 5: 提交最終代碼**
  ```bash
  git add .
  git commit -m "feat: complete renight-web sleep aid pwa application"
  ```
