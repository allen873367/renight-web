# Renight-Web (腦波同步助眠 PWA)

類似 **Renight (Nightly)** 的零成本、純前端神經聲學助眠 Web 應用程式。專為手機（iOS Safari / Android Chrome）與電腦瀏覽器床頭外放播放設計。

---

## 核心科學機制：外放單耳節拍 (Monaural Beats)

與必須配戴立體聲耳機的雙耳節拍 (Binaural Beats) 不同，**單耳節拍 (Monaural Beats)** 是在單一聲道或發聲單元中，透過載波（Carrier，約 110–136 Hz 柔和溫暖正弦波）與調製頻率在空氣中形成**實體振幅調製 (Acoustic Amplitude Modulation, AM)**：

$$S(t) = [1 + m \cdot \sin(2\pi \Delta f(t) t)] \cdot \sin(2\pi f_c t)$$

* **睡前免戴耳機**：直接將手機置於床頭 1–2 公尺外放，即可作用於聽覺皮層，促成腦波的頻率跟隨反應（Frequency Following Response）。
* **科學睡眠曲線**：
  * **入睡困難**：前 15–20 分鐘由放鬆波段（Alpha 10 Hz）漸進調降至 Theta 波（5 Hz），最後滑入深睡慢波（Delta 2 Hz），結束前 10 分鐘自動指數型淡出靜音。
  * **淺眠易醒**：全夜維持低頻 Delta（1.8 Hz）慢波結合低頻噪聲，主動遮蔽環境突發雜音。

---

## 系統特色

1. **零成本、零雲端負載**：
   * 100% 純前端 Web Audio API 實時數學合成，無需串流外部大型音訊，節省流量。
   * 完全無需支付 App Store $99/年 開發者年費，免費託管於 GitHub Pages。
2. **終身記憶免重填 (Local Storage)**：
   * 首次進入填寫 3 題睡眠困擾評估，之後每次點開網址直接秒進專屬儀表板，絕不重複彈窗。隨時可點「調整計畫」修改。
3. **極致 Mobile-First RWD 與 OLED 純黑夜間模式**：
   * 背景全黑 (`#000000`)，OLED 螢幕像素完全不發光，防藍光破壞褪黑激素。
   * 適配 iOS 瀏海、底部指示條與動態視口高度 (`100dvh`)。
   * **全站嚴禁 Emoji**，全數採用細緻極簡的線性 SVG 向量圖標，具備高質感醫療聲學風格。
4. **床頭暗屏與防休眠保護**：
   * 整合 Screen WakeLock API（微光床頭時鐘常亮）與 `MediaSession` 鎖定畫面控制器。
   * 純助眠播放器定位：定時結束前 10 分鐘平滑淡出，起床由手機內建鬧鐘負責，絕無鎖定掛起風險。
5. **晨間好眠感受打卡**：
   * 隔日開啟提供 1–5 星簡短心情評估，紀錄保留在手機本機中。

---

## 本機開發與測試

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 執行全套單元測試 (Vitest)
npm test -- --run

# 生產環境編譯打包 (輸出至 dist/)
npm run build
```

---

## 如何發布至 GitHub Pages (0 成本開箱即用)

1. 在 GitHub 上建立一個新的 Public Repository（名稱如 `renight-web`）。
2. 在本地專案資料夾推送到 GitHub：
   ```bash
   git remote add origin https://github.com/allen873367/renight-web.git
   git push -u origin main
   ```
3. 在 GitHub 倉庫中：點擊 **Settings** -> **Pages**。
   * **Source** 選擇 **GitHub Actions** 或直接將 `dist/` 分支選為靜態站台。
4. 部署完成後，即可獲得專屬公開網址：`https://allen873367.github.io/renight-web/`。

---

## 如何將網頁當作 App 使用（加入手機主畫面）

### iOS (iPhone / iPad - Safari)
1. 用 **Safari** 打開您的 Renight-Web 網址。
2. 點擊螢幕底部的「分享」按鈕（帶向上箭頭的方框）。
3. 向下滑動並選擇「**加入主畫面 (Add to Home Screen)**」。
4. 點擊右上角「新增」。之後直接從 iPhone 桌面點開即為全螢幕無邊框 App！

### Android (Chrome)
1. 用 **Chrome** 打開您的 Renight-Web 網址。
2. 點擊右上角選單「三點圖示」。
3. 選擇「**加到主螢幕**」或「**安裝應用程式**」。
