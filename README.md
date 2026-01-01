# 🦔 Wool Ball Battle - T72 Campaign
### 📖 Introduction

**Wool Ball Battle** is an interactive, gamified web application designed to educate users about the properties of Tencel PLUS+ fibers. Players join **Cici the Hedgehog🦔** on an adventure to save the "Sleep Planet" from the invading "Pilling Legion." By answering quiz questions correctly regarding fabric technology, players defeat monsters and restore the planet's protective shield.

This project utilizes a responsive design suitable for both desktop and mobile devices, featuring immersive audio-visual effects and an RPG-style combat system.

### ✨ Key Features

* **Interactive Storytelling**: A visual novel-style intro and ending sequence featuring Cici.
* **Quiz Combat System**: Battles are fought by answering multiple-choice questions. Correct answers deal damage; wrong answers hurt the player.
* **Dynamic Visuals**: High-quality animations for attacks, victory, and defeat, including particle effects and CSS animations.
* **Immersive Audio**: Context-aware background music (BGM) and sound effects (SFX) that change based on the game stage.
* **Responsive UI**: Built with Tailwind CSS to ensure a smooth experience across various screen sizes.
* **Reward Mechanism**: Upon completion, players receive a digital coupon code.

### 🛠️ Tech Stack

* **Core Framework**: [React](https://reactjs.org/) (v18+)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Build Tool**: [Vite](https://vitejs.dev/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Version Control**: Git

### 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

#### Prerequisites

* Node.js (v16.0.0 or higher)
* npm or yarn

#### Installation

1. **Clone the repository**
```bash
git clone https://github.com/KathyKo/T72-hedgehog-game.git
cd T72-hedgehog-game

```


2. **Install dependencies**
```bash
npm install

```


3. **Run the development server**
```bash
npm run dev

```


4. **Open in browser**
Visit `http://localhost:3000` (or the port shown in your terminal) to view the app.

### 📂 Project Structure

```bash
T72-hedgehog-game/
├── public/              # Static assets (images, sounds, videos)
├── src/
│   ├── constants.tsx    # Asset paths, game script, and levels data
│   ├── types.ts         # TypeScript interfaces and enums
│   ├── App.tsx          # Main game logic and UI rendering
│   ├── index.css        # Tailwind directives and global styles
│   └── main.tsx         # Entry point
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind configuration
├── vite.config.ts       # Vite configuration (includes base path)
└── README.md            # Project documentation

```

---

<a name="chinese"></a>

### 📖 專案簡介

**毛球大作戰 (Wool Ball Battle)** 是一個互動式遊戲化網頁，旨在透過趣味的方式推廣天絲 PLUS+ 纖維的特性。玩家將扮演守護者，與**刺蝟 Cici🦔** 一同冒險，保護「睡眠星球」免受邪惡「起毛球軍團」的入侵。透過回答關於布料科技的知識問答，玩家可以擊敗象徵各種布料問題的怪獸，修復防護罩。

本專案採用響應式設計，支援電腦與手機裝置，並包含豐富的視聽效果與 RPG 風格的戰鬥系統。

### ✨ 功能特色

* **互動式敘事**：包含角色對話、劇情引導與結局影片的視覺小說體驗。
* **問答戰鬥系統**：透過回答選擇題進行戰鬥。答對可擊敗怪物並獲得道具；答錯則會挑戰失敗。
* **動態視覺效果**：高品質的攻擊、勝利與失敗動畫，包含粒子特效與 CSS 動畫。
* **沉浸式音效**：根據遊戲階段（劇情、戰鬥、勝利）自動切換背景音樂 (BGM) 與音效 (SFX)。
* **響應式介面**：使用 Tailwind CSS 建構，確保在各種螢幕尺寸下皆能流暢遊玩。
* **獎勵機制**：通關後會顯示專屬優惠倒數畫面與折扣碼。

### 🚀 如何開始 (Getting Started)

請依照以下步驟在您的電腦上執行此專案。

#### 前置需求

* Node.js (建議 v16.0.0 以上)
* npm 或 yarn

#### 安裝步驟

1. **複製專案 (Clone)**
```bash
git clone https://github.com/KathyKo/T72-hedgehog-game.git
cd T72-hedgehog-game

```


2. **安裝依賴套件**
```bash
npm install

```


3. **啟動開發伺服器**
```bash
npm run dev

```


4. **在瀏覽器中開啟**
前往 `http://localhost:3000` (或終端機顯示的連接埠) 即可開始瀏覽。

### 📂 專案結構

```bash
T72-hedgehog-game/
├── public/              # 靜態資源 (圖片、音效、影片)
├── src/
│   ├── constants.tsx    # 資源路徑、遊戲腳本與關卡資料
│   ├── types.ts         # TypeScript 型別定義
│   ├── App.tsx          # 主要遊戲邏輯與畫面渲染
│   ├── index.css        # Tailwind 設定與全域樣式
│   └── main.tsx         # 程式進入點
├── package.json         # 專案設定與腳本
├── tailwind.config.js   # Tailwind 設定檔
├── vite.config.ts       # Vite 設定檔 (包含 base path 設定)
└── README.md            # 專案說明文件

```

---

© 2024 T72 Project. All Rights Reserved.
